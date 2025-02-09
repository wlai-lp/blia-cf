import { html } from 'hono/html'

export const DashboardStep2Template = (member: string, date: string) => html`
    
<div class="container mx-auto p-4 max-w-md">
    <h1 class="text-2xl font-bold mb-4">Membership Fee Tracking</h1>
    <ul class="steps w-full py-4">
        <li class="step step-primary">Payment</li>
        <li class="step step-primary">Storage</li>
        <li class="step">Deposit</li>
        <li class="step">Record</li>
    </ul>
    
    <form method="POST" enctype="multipart/form-data" hx-post="/record-fee-receipt" hx-encoding="multipart/form-data" hx-swap="none">
    <div class="space-y-4">
        <div>
            <h2 class="text-lg font-semibold mb-2">Payment recorded, please store the payment in the cabinet</h2>
            
        </div>        
    </div>
    </form>
    <div hx-get="/feed">View Feed</div>
</div>


`
