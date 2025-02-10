import { Context } from 'hono';
import { DashboardStep2Template } from '../templates/payment-step2';
import { FeeReceiptRepository } from '../db/fee-receipt';
import { getAuth } from '@hono/clerk-auth';
import { DashboardStep3Template } from '../templates/payment-step3';

type Bindings = {
  MY_BUCKET: R2Bucket;
  DB: D1Database;
}

export async function depositFee(c: Context<{ Bindings: Bindings }>) {
  try {
    const id = c.req.param("id");
    console.log("id is:", id);
    const feeReceiptRepo = new FeeReceiptRepository(c.env.DB);
    const member = await feeReceiptRepo.searchMemberFeeById(id);

    console.log("search query is:", id);
    const name = member?.first_name + ' ' + member?.last_name + ' ' + member?.chinese_name
    const memberId = member?.membership_number || ""
    const date = new Date().toISOString().split("T")[0]
  
    return c.html(DashboardStep3Template(name, memberId, id, date));
    return c.html(
      `
      <input type="text" name="member" class="input input-primary w-full" value="${member?.first_name} ${member?.last_name} ${member?.chinese_name}" disabled />
      <input type="text" name="memberid" value="${member?.membership_number}" class="hidden" />
      `
    )
  }
  catch (error) {
    console.log(error);
    return c.json({       
      success: false, 
      error: "Failed to search member"
    }, 400);
  }
}

export async function selectMember(c: Context<{ Bindings: Bindings }>) {
  try {
    const id = c.req.param("id");
    console.log("id is:", id);
    const feeReceiptRepo = new FeeReceiptRepository(c.env.DB);
    const member = await feeReceiptRepo.searchMemberById(id);

    console.log("search query is:", id);
    return c.html(
      `
      <input type="text" name="member" class="input input-primary w-full" value="${member?.first_name} ${member?.last_name} ${member?.chinese_name}" disabled />
      <input type="text" name="memberid" value="${member?.membership_number}" class="hidden" />
      `
    )
  }
  catch (error) {
    console.log(error);
    return c.json({       
      success: false, 
      error: "Failed to search member"
    }, 400);
  }
}

export async function searchMembers(c: Context<{ Bindings: Bindings }>) {
  try {
    const { member } = c.req.query();

    console.log("search query is:", member);

    if (!member || typeof member !== 'string') {
      return c.text('');
      return c.json({ 
        success: false, 
        error: 'Search query is required' 
      }, 400);
    }

    const feeReceiptRepo = new FeeReceiptRepository(c.env.DB);

    interface member_list{
      success: true,
      data: [{
        membership_number: string;
        first_name: string;
        last_name: string;
        chinese_name: string;
        phone: string;
        email: string;
      }]
    }

    // const members = await feeReceiptRepo.searchMembers(member) as unknown as member_list['data'];
    const members = await feeReceiptRepo.searchMembers(member);
    // const members = members_list_result.data;

    return c.html(
      `      
        ${members.results.map(member => `
          <li><a hx-get="/select-member/${member.membership_number}" hx-target="#member">
              ${member.first_name} ${member.last_name} ${member.chinese_name}
          </a></li>
          `).join('')}      
      
      `
    );

    return c.json({
      success: true,
      data: members
    });
  } catch (e) {
    console.error('Error searching members:', e);
    return c.json({ 
      success: false, 
      error: 'Failed to search members' 
    }, 500);
  }
}

export async function getOpenMembershipFees(c: Context<{ Bindings: Bindings }>) {
  try {
    const feeReceiptRepo = new FeeReceiptRepository(c.env.DB);
    const openFees = await feeReceiptRepo.getOpenMembershipFees();
    
    return c.html(
      `
      <h1 class="text-2xl font-bold mb-4">Membership Fees To Be Deposited</h1>
      
      ${openFees.results.map(fee => `        
        <div class="card bg-primary text-primary-content card-border w-full">
        <div class="card-body">
          <h2 class="card-title">${fee.year} - ${fee.first_name} ${fee.last_name} ${fee.chinese_name}</h2>
          <p>Stage: ${fee.current_stage}</p>
          <p>Date: ${fee.note_created_at}</p>
          <p>Handled By: ${fee.note_created_by}</p>
          <p>Note: ${fee.latest_note}</p>
           <div class="card-actions justify-end">
            <button hx-get="/deposit-fee/${fee.id}" hx-target="#dashboard" 
              class="btn btn-neutral">Deposit Now</button>
          </div>
        </div>
      </div>


        `).join('')}
      `
    )

    return c.json({
      success: true,
      data: openFees
    });
  } catch (e) {
    console.error('Error getting open membership fees:', e);
    return c.json({ 
      success: false, 
      error: 'Failed to get open membership fees' 
    }, 500);
  }
}

export async function getUnrecordedMembershipFees(c: Context<{ Bindings: Bindings }>) {
  try {
    const feeReceiptRepo = new FeeReceiptRepository(c.env.DB);
    const openFees = await feeReceiptRepo.getUnrecordedMembershipFees();
    
    return c.html(
      `
      <h1 class="text-2xl font-bold mb-4">Membership Fees To Be Recorded</h1>
      
      ${openFees.results.map(fee => `        
        <div class="card bg-primary text-primary-content card-border w-full">
        <div class="card-body">
          <h2 class="card-title">${fee.year} - ${fee.first_name} ${fee.last_name} ${fee.chinese_name}</h2>
          <p>Payment Date: ${fee.payment_date}</p>
           <div class="card-actions justify-end">
            <button hx-post="/record-master-sheet" hx-target="#dashboard" 
              class="btn btn-neutral">Record Now</button>
          </div>
        </div>
      </div>


        `).join('')}
      `
    )

    return c.json({
      success: true,
      data: openFees
    });
  } catch (e) {
    console.error('Error getting open membership fees:', e);
    return c.json({ 
      success: false, 
      error: 'Failed to get open membership fees' 
    }, 500);
  }
}

export async function recordStageNote(c: Context<{ Bindings: Bindings }>) {
  try {
    const auth = getAuth(c)   
    const clerk = c.get('clerk') 
    const user = await clerk.users.getUser(auth!.userId!);
    const userfirstName = user.firstName;
    const userlastName = user.lastName;
    console.log("firstname:", userfirstName);
    console.log("lastname:", userlastName);
    const createdBy = userfirstName + ' ' + userlastName || 'admin'
    const body = await c.req.parseBody();
    const file = body['image'];
    const memberName = body['member'] as string;
    const memberId = body['memberid'] as string;
    const year = parseInt(body['year'] as string);
    const date = body['date'] as string;
    const notes = body['notes'] as string;
    const stage = body['stage'] as string;
    const members_fees_id = body['membership_fee_id'] as string;

    // Validate required fields
    if (!members_fees_id) {
      return c.json({ error: 'Missing required fields membership_fee_id' }, 400);
    }

    // Handle file upload
    let receiptUrl: string | undefined;
    if (file && file instanceof File) {
      const r2object = await c.env.MY_BUCKET.put(`${Date.now()}${file.name}`, file);
      if (!r2object) {
        return c.json({ error: 'Failed to upload file' }, 500);
      }
      receiptUrl = r2object.key;
    }

    // Initialize repository
    const feeReceiptRepo = new FeeReceiptRepository(c.env.DB);

    const stageId = await feeReceiptRepo.getInitialStageIdByName(stage);
    if (!stageId) {
      return c.json({ error: 'Failed to get stage ' + stage }, 500);
    }

    await feeReceiptRepo.createStageNote(
      +members_fees_id,
      {
        stage_id: stageId,
        note: notes || '',
        membership_number: memberId,
        image_url: receiptUrl,
        created_by: createdBy
      }
    );

    // Proceed to step 2
    return c.html(`
      <h1 class="text-2xl font-bold mb-4">Membership Fees Deposited</h1>
      `);

  } catch (e) {
    console.error(e);
    return c.json({ error: 'Failed to record fee receipt' }, 500);
  }
}

export async function recordFeeReceipt(c: Context<{ Bindings: Bindings }>) {
  try {
    const auth = getAuth(c)   
    const clerk = c.get('clerk') 
    const user = await clerk.users.getUser(auth!.userId!);
    const userfirstName = user.firstName;
    const userlastName = user.lastName;
    console.log("firstname:", userfirstName);
    console.log("lastname:", userlastName);
    const createdBy = userfirstName + ' ' + userlastName || 'admin'
    const body = await c.req.parseBody();
    const file = body['image'];
    const memberName = body['member'] as string;
    const year = parseInt(body['year'] as string);
    const date = body['date'] as string;
    const notes = body['notes'] as string;
    const stage = body['stage'] as string;
    const memberId = body['memberid'] as string;

    // Validate required fields
    if (!memberId || !year || !date) {
      return c.json({ error: 'Missing required fields memberid, year, date' }, 400);
    }

    // Handle file upload
    let receiptUrl: string | undefined;
    if (file && file instanceof File) {
      const r2object = await c.env.MY_BUCKET.put(`${Date.now()}${file.name}`, file);
      if (!r2object) {
        return c.json({ error: 'Failed to upload file' }, 500);
      }
      receiptUrl = r2object.key;
    }

    // Initialize repository
    const feeReceiptRepo = new FeeReceiptRepository(c.env.DB);


    // Get initial stage ID, receive state
    const stageId = await feeReceiptRepo.getInitialStageIdByName(stage);
    if (!stageId) {
      return c.json({ error: 'Failed to get receive stage' }, 500);
    }

    // Create fee receipt record
    const receipt = {
      membership_number: memberId,
      year,
      amount: 40,
      payment_date: date,
      receipt_url: receiptUrl
    };

    // Debug logging
    console.log('Creating fee receipt with data:', {
      receipt,
      memberId: memberId,
      stageId,
      date
    });

    // Verify the member exists
    const memberCheck = await c.env.DB
      .prepare('SELECT membership_number FROM members WHERE membership_number = ?')
      .bind(memberId)
      .first();

    console.log('Member check result:', memberCheck);

    if (!memberCheck) {
      return c.json({
        error: 'Member not found in database',
        details: `No member found with membership number: ${memberId}`
      }, 404);
    }

    const membershipfeescount = await c.env.DB
      .prepare('SELECT COUNT(*) as count FROM membership_fees WHERE membership_number = ?')
      .bind(memberId)
      .first<{ count: number }>();

    console.log('Membership fees count:', membershipfeescount);

    try {
      // Create both fee receipt and note in a single transaction
      await feeReceiptRepo.createFeeReceiptWithNote(
        receipt,
        {
          stage_id: stageId,
          note: notes || '',
          membership_number: memberId,
          image_url: receiptUrl,
          created_by: createdBy
        }
      );

      // Proceed to step 2
      return c.html(DashboardStep2Template(memberName, date));
    } catch (error) {
      console.error('Failed to create fee receipt and note:', error);
      return c.json({
        error: 'Failed to create fee receipt',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }
  } catch (error) {
    console.error('Error recording fee receipt:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}
