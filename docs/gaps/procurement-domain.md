# Gap: Procurement (POs, suppliers)
**Status:** Missing
## Current state
- Only free-text supplier string on assets/inventory items. No PO/vendor entities anywhere.
## What's missing
- Supplier registry, purchase orders + line items, goods-received linking to inventory stock movements.
## Suggested approach
- `suppliers` + `purchase_orders` (+items) tables; PO lifecycle draft->ordered->received->closed; on "received" call StockService::recordMovement to ingest stock (existing service). Pages under Inventory group with manage_procurement permissions (add to PermissionSeeder + superadmin auto-inherits).
## Dependencies
- Inventory (exists) for receiving integration.
