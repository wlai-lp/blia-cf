import { html } from 'hono/html'

export const DashboardStep4Template = (member: string, member_id: string, date: string) => html`
    
<div class="container mx-auto p-4 max-w-md">
    <h1 class="text-2xl font-bold mb-4">Membership Fee Tracking</h1>
    <ul class="steps w-full py-4">
        <li class="step step-primary">Payment</li>
        <li class="step step-primary">Storage</li>
        <li class="step step-primary">Deposit</li>
        <li class="step step-primary">Record</li>
    </ul>
    
    <form method="POST" enctype="multipart/form-data" hx-post="/record-fee-receipt" hx-encoding="multipart/form-data" hx-swap="none">
    <div class="space-y-4">
        <div>
            <h2 class="text-lg font-semibold mb-2">1. Selected Member</h2>
            <div class="space-y-2">
                <input type="text" name="member" placeholder="Search member..." class="input input-primary w-full" value="${member}" disabled/>
                <input type="text" name="memberid" value=""${member_id}" class="hidden" />
                <input type="text" name="stage" value="Recorded" class="hidden" />
            </div>
        </div>
        <div>
            <h2 class="text-lg font-semibold mb-2">2. Select Recording Date</h2>
            <input type="date" name="date" class="w-full input" value="${date}"/>
        </div>
                
        <div>
            <h2 class="text-lg font-semibold mb-2">4. Submit</h2>
            <button type="submit" class="btn btn-primary">Recorded To Master Sheet</button>            
        </div>
        <div>

        </div>
    </div>
    </form>
    <div hx-get="/feed">View Feed</div>
</div>


`
