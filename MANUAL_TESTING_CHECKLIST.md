# Manual Testing Checklist

## Overview
This checklist covers manual testing procedures for the Career Vision Explorer dashboard. Use this alongside automated tests to ensure complete functionality verification.

## Pre-requisites
- [ ] Development server running on http://localhost:8081
- [ ] Backend API server running and accessible
- [ ] Test data seeded in database
- [ ] Multiple test user accounts created (admin, employer, job seeker)

## 1. Authentication & Authorization

### Login Flow
- [ ] Can login with valid credentials
- [ ] Error message appears for invalid credentials
- [ ] Password field is masked
- [ ] "Remember me" checkbox works
- [ ] Forgot password link is functional
- [ ] Session persists on page refresh
- [ ] Logout clears session completely

### Registration Flow
- [ ] All form fields validate properly
- [ ] Password strength indicator works
- [ ] Email validation prevents duplicates
- [ ] Terms acceptance is required
- [ ] Successful registration redirects to appropriate dashboard
- [ ] Welcome email is sent (check email)

### Role-Based Access
- [ ] Job seekers cannot access employer pages
- [ ] Employers cannot access admin pages
- [ ] Admins can access all areas
- [ ] Unauthorized access redirects to login

## 2. Dashboard Functionality

### Admin Dashboard
- [ ] Total users count is accurate
- [ ] Active jobs count updates in real-time
- [ ] Recent activity shows latest actions
- [ ] Charts load and display correctly
- [ ] Export functionality works for reports
- [ ] Date range filters update statistics

### Employer Dashboard
- [ ] Job posting statistics are accurate
- [ ] Application notifications appear
- [ ] Quick actions menu works
- [ ] Analytics charts display correctly
- [ ] Can navigate to all employer features

### Job Seeker Dashboard
- [ ] Profile completion percentage is accurate
- [ ] Recommended jobs are relevant
- [ ] Application status tracker works
- [ ] Skill match scores display
- [ ] Recent job views are tracked

## 3. Job Management

### Creating Jobs (Employer)
- [ ] All required fields validate
- [ ] Rich text editor formats correctly
- [ ] Skill tags autocomplete works
- [ ] Salary range validation works
- [ ] Preview shows accurate representation
- [ ] Published job appears immediately

### Viewing Jobs
- [ ] Search filters work correctly
- [ ] Pagination loads smoothly
- [ ] Job cards display all information
- [ ] Click to view details works
- [ ] Share buttons function properly
- [ ] Save/bookmark feature works

### Editing Jobs
- [ ] Can edit all job fields
- [ ] Changes reflect immediately
- [ ] Version history is maintained
- [ ] Can toggle job active/inactive
- [ ] Deletion requires confirmation

## 4. Application Process

### Applying for Jobs
- [ ] Apply button is disabled if already applied
- [ ] Cover letter field accepts formatting
- [ ] Resume upload works (PDF, DOC, DOCX)
- [ ] Application confirmation appears
- [ ] Email notification is sent

### Managing Applications
- [ ] Employer sees all applications
- [ ] Can filter by status
- [ ] Can download resumes
- [ ] Status updates notify applicant
- [ ] Bulk actions work correctly

## 5. Real-time Features

### Notifications
- [ ] Bell icon shows unread count
- [ ] Clicking shows notification dropdown
- [ ] Mark as read works
- [ ] Real-time updates without refresh
- [ ] Sound/browser notifications work (if enabled)

### Live Statistics
- [ ] Dashboard numbers update live
- [ ] No page refresh needed
- [ ] WebSocket connection is stable
- [ ] Reconnects after network issues

## 6. Search & Filtering

### Job Search
- [ ] Keyword search returns relevant results
- [ ] Location filter works correctly
- [ ] Salary range filter is accurate
- [ ] Multiple filters can combine
- [ ] Clear filters button works
- [ ] Search suggestions appear

### Advanced Filters
- [ ] Experience level filter works
- [ ] Job type filter works
- [ ] Industry filter works
- [ ] Posted date filter works
- [ ] Sort options work correctly

## 7. Profile Management

### Profile Editing
- [ ] All fields save correctly
- [ ] Image upload works
- [ ] Image cropping tool functions
- [ ] Skills can be added/removed
- [ ] Work experience validates dates
- [ ] Education section works properly

### Privacy Settings
- [ ] Profile visibility toggles work
- [ ] Email preferences save
- [ ] Data export works
- [ ] Account deletion process works

## 8. Mobile Responsiveness

### Navigation
- [ ] Hamburger menu appears on mobile
- [ ] All menu items are accessible
- [ ] Touch targets are appropriately sized
- [ ] Swipe gestures work (if implemented)

### Forms
- [ ] All forms are usable on mobile
- [ ] Keyboard doesn't obscure inputs
- [ ] Date pickers work on touch devices
- [ ] File uploads work on mobile

### Layout
- [ ] No horizontal scrolling
- [ ] Images scale appropriately
- [ ] Text remains readable
- [ ] Buttons are easily tappable
- [ ] Modals fit screen properly

## 9. Performance

### Page Load Times
- [ ] Homepage loads in < 3 seconds
- [ ] Dashboard loads in < 2 seconds
- [ ] Search results appear quickly
- [ ] Images lazy load properly
- [ ] No blocking resources

### Interactions
- [ ] Buttons respond immediately
- [ ] Forms submit without lag
- [ ] Animations are smooth
- [ ] Scrolling is performant
- [ ] No memory leaks over time

## 10. Accessibility

### Keyboard Navigation
- [ ] Tab order is logical
- [ ] All interactive elements are reachable
- [ ] Focus indicators are visible
- [ ] Skip links work
- [ ] Escape key closes modals

### Screen Reader Support
- [ ] Alt text for all images
- [ ] ARIA labels are present
- [ ] Form labels are associated
- [ ] Error messages are announced
- [ ] Page structure is semantic

### Visual Accessibility
- [ ] Color contrast meets WCAG standards
- [ ] Text can be zoomed to 200%
- [ ] No information conveyed by color alone
- [ ] Focus indicators are clear

## 11. Error Handling

### Network Errors
- [ ] Offline message appears appropriately
- [ ] Retry mechanisms work
- [ ] Cached data displays when available
- [ ] Graceful degradation occurs

### Form Errors
- [ ] Validation messages are clear
- [ ] Fields highlight errors
- [ ] Error summary appears
- [ ] Can recover from errors

### API Errors
- [ ] 404 pages display correctly
- [ ] 500 errors show user-friendly message
- [ ] Rate limit messages are clear
- [ ] Timeout errors are handled

## 12. Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## 13. Security

### Authentication Security
- [ ] Passwords are not visible in network tab
- [ ] Sessions expire appropriately
- [ ] CSRF protection works
- [ ] XSS prevention is active

### Data Security
- [ ] HTTPS is enforced
- [ ] Sensitive data is not in URLs
- [ ] File uploads are validated
- [ ] SQL injection is prevented

## 14. Integration Testing

### Third-party Services
- [ ] Email sending works
- [ ] File storage integration works
- [ ] Payment processing (if applicable)
- [ ] Analytics tracking works
- [ ] Social media sharing works

### API Integration
- [ ] All endpoints return expected data
- [ ] Pagination works correctly
- [ ] Filtering returns accurate results
- [ ] Sorting works as expected
- [ ] Rate limiting is appropriate

## Test Execution Log

| Test Area | Tester | Date | Status | Notes |
|-----------|--------|------|--------|-------|
| Authentication | | | | |
| Dashboard | | | | |
| Job Management | | | | |
| Applications | | | | |
| Real-time | | | | |
| Search | | | | |
| Profile | | | | |
| Mobile | | | | |
| Performance | | | | |
| Accessibility | | | | |
| Errors | | | | |
| Browser Compat | | | | |
| Security | | | | |
| Integration | | | | |

## Issues Found

### Critical Issues
1. 
2. 

### High Priority Issues
1. 
2. 

### Medium Priority Issues
1. 
2. 

### Low Priority Issues
1. 
2. 

## Sign-off

- [ ] All critical functionality tested
- [ ] No blocking issues found
- [ ] Performance is acceptable
- [ ] Security requirements met
- [ ] Ready for production deployment

**Tested by:** _________________  
**Date:** _________________  
**Approved by:** _________________
