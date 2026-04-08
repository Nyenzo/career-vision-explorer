import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'yoloone@example.com';
const TEST_PASSWORD = 'password';

const normalizeRole = (role?: string) => {
    if (!role) return '';
    const normalized = role.trim().toLowerCase().replace(/[-\s]+/g, '_');
    return normalized === 'jobseeker' ? 'job_seeker' : normalized;
};

const dashboardForRole = (role: 'job_seeker' | 'freelancer') =>
    role === 'job_seeker' ? '/jobseeker/dashboard' : '/freelancer/dashboard';

test.describe('Role Route Matrix Smoke', () => {
    test('enforces role-specific dashboard routing for job_seeker and freelancer', async ({ page, request }) => {
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

        await page.addInitScript(({ seededToken, seededRefreshToken, seededUser }) => {
            localStorage.setItem('access_token', seededToken);
            localStorage.setItem('refresh_token', seededRefreshToken);
            localStorage.setItem('user', JSON.stringify(seededUser));
        }, {
            seededToken: token,
            seededRefreshToken: refreshToken,
            seededUser: {
                user_id: loginPayload.user_id,
                name: '',
                email: loginPayload.email,
                account_type: loginPayload.account_type,
            },
        });

        const authHeaders = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        };

        const rolesResponse = await request.get('http://localhost:8000/api/v1/roles/my', {
            headers: authHeaders,
        });
        expect(rolesResponse.ok()).toBeTruthy();
        const rolesPayload = await rolesResponse.json();

        const roleSet = new Set<string>((rolesPayload.roles || []).map((r: string) => normalizeRole(r)));

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

        const assertMatrixForActiveRole = async (activeRole: 'job_seeker' | 'freelancer') => {
            const switchResponse = await request.post('http://localhost:8000/api/v1/roles/switch', {
                headers: authHeaders,
                data: { role: activeRole },
            });
            expect(switchResponse.ok()).toBeTruthy();

            // Generic /dashboard should always resolve to current active role's dashboard.
            await page.goto('/dashboard');
            await expect(page).toHaveURL(new RegExp(`${dashboardForRole(activeRole)}$`));

            // Allowed route should stay on the same route.
            await page.goto(dashboardForRole(activeRole));
            await expect(page).toHaveURL(new RegExp(`${dashboardForRole(activeRole)}$`));

            // Forbidden opposite route should bounce back to active role dashboard.
            const oppositeRole = activeRole === 'job_seeker' ? 'freelancer' : 'job_seeker';
            await page.goto(dashboardForRole(oppositeRole));
            await expect(page).toHaveURL(new RegExp(`${dashboardForRole(activeRole)}$`));
        };

        await assertMatrixForActiveRole('job_seeker');
        await assertMatrixForActiveRole('freelancer');
    });
});
