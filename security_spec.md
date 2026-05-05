# Security Specification: Lookat Business Dashboard

## Data Invariants
1. **User Identity Invariant**: A user can only access their own orders, customers, tickets, and withdrawal requests.
2. **Admin Privilege Invariant**: Only users with the `is_admin` flag set to `true` in their `users` document can perform administrative actions (managing products, updating site settings, processing withdrawals).
3. **Product Integrity**: Products are public for reading but strictly managed by admins to maintain catalog integrity.
4. **Order Status Lifecycle**: Users cannot self-approve or complete their own orders; these states are terminal or managed by admins.
5. **Withdrawal Request Integrity**: A withdrawal request cannot be modified by a user after creation; only admins can move it to 'completed'.

## The "Dirty Dozen" Payloads (Denial Tests)
1. **Identity Spoofing**: Regular user trying to read another user's document in `/users/{userId}`.
2. **Admin Escalation**: Regular user trying to set `is_admin: true` during profile creation.
3. **Ghost Field Injection**: User trying to add `secret_discount: 100` to an order document.
4. **Product Manipulation**: Regular user trying to `update` a product price.
5. **Customer Hijack**: User A trying to `delete` a customer record belonging to User B.
6. **Order Price Tampering**: User trying to `create` an order with `profit` calculated incorrectly (must be verified server-side or strictly checked).
7. **Withdrawal status skip**: User trying to `create` a withdrawal request with `status: 'completed'`.
8. **Invalid ID Poisoning**: Trying to use a 2MB string as a `productId`.
9. **Timestamp Spoofing**: User providing a `created_at` date from 2020.
10. **Terminal State Break**: User trying to `update` an order that is already marked as `completed`.
11. **Negative Withdrawal**: User trying to request a withdrawal of `-1000` IQD.
12. **Blanket Read Attack**: Trying to `list` all orders without a `user_id` filter (must be rejected by rules).

## Test Runner (Planned)
The `firestore.rules` will be verified against these scenarios.
