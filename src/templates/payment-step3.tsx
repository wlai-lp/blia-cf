import { html } from 'hono/html'

export const DashboardStep3Template = (member_name: string, member_id: string, membership_fee_id: string, date: string) => html`
    
<div class="container mx-auto p-4 max-w-md">
    <h1 class="text-2xl font-bold mb-4">Membership Fee Tracking</h1>
    <ul class="steps w-full py-4">
        <li class="step step-primary">Payment</li>
        <li class="step step-primary">Storage</li>
        <li class="step step-primary">Deposit</li>
        <li class="step">Record</li>
    </ul>
    
    <form method="POST" enctype="multipart/form-data" hx-post="/record-deposit" hx-encoding="multipart/form-data">
    <div class="space-y-4">
        <div>
            <h2 class="text-lg font-semibold mb-2">1. Selected Member</h2>
            <div class="space-y-2">
                <input type="text" name="member" placeholder="Search member..." class="input input-primary w-full" value="${member_name}" disabled/>
                <input type="text" name="memberid" value="${member_id}" class="hidden" />
                <input type="text" name="membership_fee_id" value="${membership_fee_id}" class="hidden" />
                <input type="text" name="stage" value="Deposited" class="hidden" />
            </div>
        </div>
        <div>
            <h2 class="text-lg font-semibold mb-2">2. Select Deposit Date</h2>
            <input type="date" name="date" class="w-full input" value="${date}" />
        </div>

        <div>
            <h2 class="text-lg font-semibold mb-2">3. Upload Picture of the Deposit</h2>
            
            <fieldset class="fieldset">
                <legend class="fieldset-legend">Pick a file or take a photo</legend>
                <input type="file" class="w-full file-input" id="upload" name="image" accept="image/*">                
            </fieldset>                        
        </div>
        

        <div>
            <h2 class="text-lg font-semibold mb-2">4. Submit</h2>
            <button type="submit" class="btn btn-primary">Record Deposit</button>            
        </div>
        <div>

        </div>
    </div>
    </form>
    
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
