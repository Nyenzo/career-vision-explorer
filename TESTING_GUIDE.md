# Testing Guide for Career Vision Explorer

## Quick Start

### Prerequisites
1. Ensure the development server is running:
   ```bash
   npm run dev
   ```

2. Ensure the backend API is accessible (update `.env` if needed)

3. Install Playwright browsers (first time only):
   ```bash
   npx playwright install
   ```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests with UI Mode (Recommended for debugging)
```bash
npm run test:ui
```

### Run Specific Test Suite
```bash
# Authentication tests
npm run test:auth

# Job management tests
npm run test:jobs

# Responsive design tests
npm run test:responsive
```

### Run Tests in Headed Mode (See browser)
```bash
npm run test:headed
```

### Debug Tests
```bash
npm run test:debug
```

### Generate Comprehensive Test Report
```bash
npm run test:integration
```
This will run all tests across multiple browsers and generate an HTML report.

## View Test Results

### View HTML Report
After running tests:
```bash
npm run test:report
```

### View Integration Test Report
Open `test-report.html` in your browser after running `npm run test:integration`

## Test Coverage Areas

1. **Authentication & Authorization**
   - Login/Logout flows
   - Registration process
   - Role-based access control
   - Session management

2. **Job Management**
   - Creating, editing, deleting jobs
   - Searching and filtering
   - Pagination
   - Job details view

3. **Application Process**
   - Submitting applications
   - Managing applications
   - Status updates

4. **Dashboard Features**
   - Statistics display
   - Real-time updates
   - Charts and visualizations
   - Notifications

5. **Responsive Design**
   - Mobile navigation
   - Touch interactions
   - Layout adaptations
   - Form usability

6. **API Integration**
   - Data fetching
   - Error handling
   - Real-time updates
   - File uploads

## Manual Testing

For features that require manual verification, use the checklist:
1. Open `MANUAL_TESTING_CHECKLIST.md`
2. Follow the checklist systematically
3. Document any issues found

## Common Issues and Solutions

### Tests Failing Due to Timeouts
- Increase timeout in `playwright.config.ts`
- Check if backend API is responding
- Verify network connectivity

### Authentication Tests Failing
- Ensure test user accounts exist in database
- Check API authentication endpoints
- Verify CORS settings

### Responsive Tests Failing
- Update viewport sizes if needed
- Check CSS media queries
- Verify mobile menu implementation

### API Tests Failing
- Confirm backend server is running
- Check API base URL configuration
- Verify API endpoints match expected paths

## Best Practices

1. **Before Running Tests**
   - Clear browser cache
   - Reset test database if needed
   - Close other applications to free resources

2. **During Development**
   - Run relevant tests after making changes
   - Use UI mode for debugging
   - Check test reports for detailed failures

3. **Before Deployment**
   - Run full test suite
   - Complete manual testing checklist
   - Test on multiple browsers
   - Verify mobile responsiveness

## Test Data

Default test accounts:
- Admin: `admin@example.com` / `admin123`
- Employer: `employer@example.com` / `password123`
- Job Seeker: `jobseeker@example.com` / `password123`

## Continuous Integration

For CI/CD pipelines, use:
```bash
# Run tests in CI mode
CI=true npm test

# Run specific browser tests
npm test -- --project=chromium
```

## Troubleshooting

### Port Conflicts
If port 8081 is in use, update:
1. `vite.config.ts` - change dev server port
2. `playwright.config.ts` - update baseURL

### Memory Issues
For systems with limited memory:
```bash
# Run tests sequentially
npm test -- --workers=1
```

### Network Issues
For flaky network:
```bash
# Increase timeout and retries
npm test -- --timeout=60000 --retries=2
```

## Getting Help

1. Check Playwright documentation: https://playwright.dev
2. Review test files in `tests/e2e/`
3. Check console output for detailed error messages
4. Use `--debug` flag for step-by-step debugging
