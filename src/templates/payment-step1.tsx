import { html } from 'hono/html'

export const DashboardStep1Template = (date: string, year: number) => html`
    
<div class="container mx-auto p-4 max-w-md">
    <h1 class="text-2xl font-bold mb-4">New Membership Fee Tracking</h1>
    <ul class="steps w-full py-4">
        <li class="step step-primary">Payment</li>
        <li class="step">Storage</li>
        <li class="step">Deposit</li>
        <li class="step">Record</li>
    </ul>
    
    <form method="POST" enctype="multipart/form-data" hx-post="/record-fee-receipt" 
          hx-encoding="multipart/form-data" 
          hx-target="#dashboard">
    <div class="space-y-4">
        <div>
            <input type="text" name="stage" value="Received" class="hidden" />
            <h2 class="text-lg font-semibold mb-2">1. Select Member</h2>

            <div id="member" class="dropdown dropdown-hover w-full">
                <div tabindex="0" role="button">
                    
                    <input hx-get="/search-members" hx-trigger="keyup" hx-target="#member-list" hx-swap="outterHTML"
                        type="text" name="member" placeholder="Search member..." class="input input-primary w-full" />
                    <input type="text" name="memberid" value="1" class="hidden" />
                    
                    
                </div>
            
                <ul id="member-list" tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-1 w-full p-2 shadow-sm">
                    ...
                </ul>
                
            </div>
        </div>

        <div>
            <h2 class="text-lg font-semibold mb-2">2. Membership Year</h2>
            
            <select class="w-full select" name="year">
                <option disabled selected>Pick a year</option>
                ${Array.from({ length: 3 }, (_, i) => year - i).map((year) => html`
                    <option value="${year}">${year}</option>
                `)}
            </select>                     
        </div>
        
        <div>
            <h2 class="text-lg font-semibold mb-2">3. Select Receive Date</h2>
            <input type="date" name="date" class="w-full input" value="${date}"/>
        </div>

        <div>
            <h2 class="text-lg font-semibold mb-2">4. Upload Proof</h2>
            
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Pick a file or take a photo</legend>
                <input type="file" class="w-full file-input" id="upload" name="image" accept="image/*">                
            </fieldset>                        
        </div>                        

        <div>
            <h2 class="text-lg font-semibold mb-2">5. Notes</h2>            
            <textarea type="text" name="notes" placeholder="placed in the cabinet" class="w-full textarea textarea-info"></textarea>                     
        </div>

        <div>
            <h2 class="text-lg font-semibold mb-2">6. Submit</h2>
            <button type="submit" class="btn btn-primary">Record Fee Receipt</button>
            
        </div>
    </div>
    </form>
    <div hx-get="/feed">View Feed</div>
</div>

<script>

function resizeImage(file, maxWidth, maxHeight, callback) {
    const reader = new FileReader();
    
    reader.onload = function (event) {
        const img = new Image();
        img.src = event.target.result;

        img.onload = function () {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;

            // Resize while maintaining aspect ratio
            if (width > maxWidth || height > maxHeight) {
                const aspectRatio = width / height;
                if (width > height) {
                    width = maxWidth;
                    height = Math.round(maxWidth / aspectRatio);
                } else {
                    height = maxHeight;
                    width = Math.round(maxHeight * aspectRatio);
                }
            }

            // Draw the resized image on canvas
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to Blob and return via callback
            canvas.toBlob((blob) => {
                const resizedFile = new File([blob], file.name, { type: file.type });
                callback(resizedFile);
            }, file.type, 0.9); // Adjust quality if needed
        };
    };

    reader.readAsDataURL(file);
}

// Assign resized file back to input
document.getElementById("upload").addEventListener("change", function (event) {
    console.log('doc upload change event');
    const fileInput = event.target;
    const file = fileInput.files[0];

    if (file) {
        resizeImage(file, 800, 600, (resizedFile) => {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(resizedFile);
            fileInput.files = dataTransfer.files; // Set the resized file back to input

            console.log("Resized file set to input:", fileInput.files[0]);
        });
    }
});
</script>

`
