# Earth Carbon Registry - Administrator Manual

## Accessing the Admin Panel

1. Sign in at https://registryearthcarbon.org/signin with your admin account
2. Navigate to the Admin Panel via the navigation bar
3. Direct URL: https://registryearthcarbon.org/admin

## Managing Actions

### Viewing Actions
- All registered actions appear in the "Registered Actions" tab
- Filter by status: All / Pending / Verified / Rejected
- Filter by action type from the dropdown

### Verifying Actions
1. Review action details: location, quantity, uploaded photos
2. Click the status dropdown next to the action
3. Select "Verified" to approve the action
4. The action will display a green "Verified" badge on the verification page

### Rejecting Actions
1. Select "Rejected" from the status dropdown
2. The user can see the rejected status in their dashboard

### Exporting Data
1. Click the "Export CSV" button at the top right
2. Downloads all actions matching your current filters
3. Opens in Excel or Google Sheets

## Managing Users

### Viewing Users
- Click the "Users" tab in the admin panel
- Displays: Name, Email, Role, Join Date

### Promoting to Admin
1. Find the user in the list
2. Click "Make Admin"
3. User gains admin panel access on next login

### Removing Admin Access
1. Find the admin user in the list
2. Click "Remove Admin"
3. User reverts to regular user role

## Dashboard Statistics

| Metric | Description |
|---|---|
| Total Actions | Count of all registered actions |
| Verified | Count of verified actions |
| Total CO₂e | Sum of all verified CO₂e reductions |
| Revenue | Total registration fees collected |

## Best Practices

### Action Verification
- Verify photos show actual installation
- Check location makes sense for the action type
- Validate quantity is reasonable
- Process verifications within 48 hours

### User Management
- Only promote trusted users to admin
- Keep at least 2 active admin accounts
- Regularly review the admin list

### Data Exports
- Export monthly for backup
- Use for impact reports and stakeholder updates

## Troubleshooting

| Issue | Solution |
|---|---|
| Cannot access admin panel | Verify your account has `role: "admin"` in Firestore |
| Action not appearing | Check Firestore rules are deployed; refresh the page |
| Status change not saving | Check network connection; verify Firestore rules allow admin writes |
