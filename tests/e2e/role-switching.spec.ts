import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'yoloone@example.com';
const TEST_PASSWORD = 'password';

test.describe('Role Switching E2E', () => {
    test('can switch job seeker and freelancer both directions', async ({ page, request }) => {
        const loginResponse = await request.post('http://localhost:8000/api/v1/auth/login', {
            data: {
                email: TEST_EMAIL,
                password: TEST_PASSWORD,
            },
        });
        expect(loginResponse.ok()).toBeTruthy();
        const loginPayload = await loginResponse.json();

        const token = loginPayload.access_token as string;
        const refreshToken = loginPayload.refresh_token as string;
        const user = {
            user_id: loginPayload.user_id,
            name: '',
            email: loginPayload.email,
            account_type: loginPayload.account_type,
        };

        await page.addInitScript(({ seededToken, seededRefreshToken, seededUser }) => {
            localStorage.setItem('access_token', seededToken);
            localStorage.setItem('refresh_token', seededRefreshToken);
            localStorage.setItem('user', JSON.stringify(seededUser));
        }, { seededToken: token, seededRefreshToken: refreshToken, seededUser: user });

        await page.goto('/jobseeker/dashboard');
        await expect(page).toHaveURL(/\/(jobseeker|freelancer)\/dashboard/);

        const authHeaders = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        };

        const rolesResponse = await request.get('http://localhost:8000/api/v1/roles/my', {
            headers: authHeaders,
        });
        expect(rolesResponse.ok()).toBeTruthy();
        const rolesPayload = await rolesResponse.json();
        const normalizeRole = (role?: string) => {
            if (!role) return '';
            const normalized = role.trim().toLowerCase().replace(/[-\s]+/g, '_');
            return normalized === 'jobseeker' ? 'job_seeker' : normalized;
        };
        const initialActiveRole = normalizeRole(rolesPayload.active_role);

        const roleSet = new Set<string>((rolesPayload.roles || []).map((r: string) => (r === 'jobseeker' ? 'job_seeker' : r)));

        if (!roleSet.has('job_seeker')) {
            const addJobSeeker = await request.post('http://localhost:8000/api/v1/roles/add', {
                headers: authHeaders,
                data: { role: 'job_seeker' },
            });
            expect(addJobSeeker.ok()).toBeTruthy();
        }

        if (!roleSet.has('freelancer')) {
            const addFreelancer = await request.post('http://localhost:8000/api/v1/roles/add', {
                headers: authHeaders,
                data: { role: 'freelancer' },
            });
            expect(addFreelancer.ok()).toBeTruthy();
        }

        await page.reload();

        const switchToRole = async (targetRole: 'job_seeker' | 'freelancer') => {
            const switchResponse = await request.post('http://localhost:8000/api/v1/roles/switch', {
                headers: authHeaders,
                data: { role: targetRole },
            });
            expect(switchResponse.ok()).toBeTruthy();

            if (targetRole === 'job_seeker') {
                await page.goto('/jobseeker/dashboard');
                await expect(page).toHaveURL(/\/jobseeker\/dashboard/);
            } else {
                await page.goto('/freelancer/dashboard');
                await expect(page).toHaveURL(/\/freelancer\/dashboard/);
            }
        };

        if (initialActiveRole === 'job_seeker') {
            await switchToRole('freelancer');

            await switchToRole('job_seeker');

            await switchToRole('freelancer');
        } else {
            await switchToRole('job_seeker');

            await switchToRole('freelancer');

            await switchToRole('job_seeker');

            await switchToRole('freelancer');
        }

        // Verify backend active_role matches UI switch.
        const verifyResponse = await request.get('http://localhost:8000/api/v1/roles/my', {
            headers: authHeaders,
        });
        expect(verifyResponse.ok()).toBeTruthy();
        const verifyPayload = await verifyResponse.json();
        const normalizedActiveRole = normalizeRole(verifyPayload.active_role);
        expect(normalizedActiveRole).toBe('freelancer');
    });
});
