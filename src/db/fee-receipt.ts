export interface FeeReceipt {
    membership_number: string;
    year: number;
    amount: number;
    payment_date: string;
    receipt_url?: string;
}

export interface FeeStageNote {
    membership_fees_id?: number; // Optional because it will be set during creation
    stage_id: number;
    membership_number: string;
    note: string;
    created_by: string;
    image_url?: string;
}

export class FeeReceiptRepository {
    constructor(private db: D1Database) { }

    private async verifyMember(membership_number: string) {
        // First verify the member exists
        const memberExists = await this.db
            .prepare('SELECT 1 FROM members WHERE membership_number = ?')
            .bind(membership_number)
            .first<{ 1: number }>();

        console.log('Member exists check:', { memberExists, membership_number });

        if (!memberExists) {
            throw new Error(`Member with number ${membership_number} not found`);
        }
    }

    async createStageNote(membership_fees_id: number, note: FeeStageNote) {
        // if it's received then we only have to create the note
        // we should have membership fee id
        console.log('Creating stage note:', { membership_fees_id, note });
        try {
            await this.db
                .prepare(
                    `INSERT INTO membership_fee_stage_notes 
                     (membership_fees_id, stage_id, membership_number, note, created_by, image_url)
                     VALUES (?, ?, ?, ?, ?, ?)`
                )
                .bind(
                    membership_fees_id,
                    note.stage_id,
                    note.membership_number,
                    note.note || '', // Handle empty notes
                    note.created_by,
                    note.image_url
                )
                .run();

            // now mark the fee as completed, we don't make it completed here
            // await this.db
            //     .prepare('UPDATE membership_fees SET completed = 1 WHERE id = ?')
            //     .bind(membership_fees_id)
            //     .run();

            return { success: true, receipt_id: membership_fees_id };
        } catch (error) {
            console.error('Error in transaction:', error);
            throw error;
        }
    }

    private async checkDuplicateFee(membership_number: string, year: number) {
        const existingFee = await this.db
            .prepare(
                `SELECT id FROM membership_fees 
                 WHERE membership_number = ? AND year = ?`
            )
            .bind(membership_number, year)
            .first<{ id: number }>();

        if (existingFee) {
            throw new Error(`A membership fee record for member ${membership_number} and year ${year} already exists`);
        }
    }

    async createFeeReceiptWithNote(receipt: FeeReceipt, note: FeeStageNote) {
        // Verify constraints first
        await this.verifyMember(receipt.membership_number);

        // Check for duplicate fee record
        await this.checkDuplicateFee(receipt.membership_number, receipt.year);

        console.log('Creating fee receipt and note in transaction:', { receipt, note });

        try {
            // Use D1's transaction API
            const result = await this.db.batch([
                // First statement: Insert receipt and get its ID
                this.db
                    .prepare(
                        `INSERT INTO membership_fees (membership_number, year, amount, payment_date)
                         VALUES (?, ?, ?, ?)
                         RETURNING id`
                    )
                    .bind(
                        receipt.membership_number,
                        receipt.year,
                        receipt.amount,
                        receipt.payment_date
                    ),
            ]);

            const receiptResult = result[0] as { results?: { id: number }[] };
            if (!receiptResult?.results?.[0]?.id) {
                throw new Error('Failed to get inserted receipt ID');
            }

            const receiptId = receiptResult.results[0].id;
            console.log('Inserted receipt with ID:', receiptId);

            // Second statement: Insert note with the receipt ID
            await this.db
                .prepare(
                    `INSERT INTO membership_fee_stage_notes 
                     (membership_fees_id, stage_id, membership_number, note, created_by, image_url)
                     VALUES (?, ?, ?, ?, ?, ?)`
                )
                .bind(
                    receiptId,
                    note.stage_id,
                    note.membership_number,
                    note.note || '', // Handle empty notes
                    note.created_by,
                    note.image_url
                )
                .run();

            return { success: true, receipt_id: receiptId };
        } catch (error) {
            console.error('Error in transaction:', error);
            throw error;
        }
    }



    async getMemberByName(firstName: string, lastName: string) {
        // First try exact match
        let result = await this.db
            .prepare(
                `SELECT membership_number, first_name, last_name
                 FROM members
                 WHERE first_name = ? AND last_name = ?`
            )
            .bind(firstName, lastName)
            .first<{ membership_number: string; first_name: string; last_name: string }>();

        if (!result) {
            // Try case-insensitive match
            result = await this.db
                .prepare(
                    `SELECT membership_number, first_name, last_name
                     FROM members
                     WHERE LOWER(first_name) = LOWER(?) AND LOWER(last_name) = LOWER(?)`
                )
                .bind(firstName, lastName)
                .first<{ membership_number: string; first_name: string; last_name: string }>();
        }

        if (result) {
            console.log('Found member:', result);
        } else {
            console.log('No member found for:', { firstName, lastName });
        }

        return result;
    }

    async getInitialStageIdByName(name: string) {
        const result = await this.db
            .prepare(
                `SELECT id 
                 FROM membership_fee_stages 
                 WHERE stage_name = ? 
                 LIMIT 1`
            )
            .bind(name)
            .first<{ id: number }>();
        return result?.id;
    }

    async searchMemberById(membership_number: string) {
        const result = await this.db
            .prepare(
                `SELECT membership_number, first_name, last_name, chinese_name
                 FROM members
                 WHERE membership_number = ?`
            )
            .bind(membership_number)
            .first<{
                membership_number: string;
                first_name: string;
                last_name: string;
                chinese_name: string;
                phone: string;
                email: string;
            }>();
        return result;
    }

    async searchMemberFeeById(id: string) {
        const result = await this.db
            .prepare(
                `SELECT m.membership_number, m.first_name, m.last_name, m.chinese_name
                 FROM membership_fees mf
                 JOIN members m ON m.membership_number = mf.membership_number
                 WHERE mf.id = ?`
            )
            .bind(id)
            .first<{
                membership_number: string;
                first_name: string;
                last_name: string;
                chinese_name: string;
            }>();
        return result;
    }

    async searchMembers(query: string) {
        // Prepare the search terms for LIKE clauses
        const searchTerm = `%${query}%`;

        const result = await this.db
            .prepare(
                `SELECT 
                    membership_number,
                    first_name,
                    last_name,
                    chinese_name                    
                FROM members
                WHERE first_name LIKE ?
                   OR last_name LIKE ?
                   OR chinese_name LIKE ?
                LIMIT 3`
            )
            .bind(searchTerm, searchTerm, searchTerm)
            .all<{
                membership_number: string;
                first_name: string;
                last_name: string;
                chinese_name: string;
                phone: string;
                email: string;
            }>();

        return result;
    }

    async getOpenMembershipFees() {
        const result = await this.db
            .prepare(
                `SELECT
                mf.id,
                mf.membership_number,
                mf.year,  
                mf.payment_date,
                mf.completed,
                m.first_name,
                m.last_name,
                m.chinese_name,
                (
                    SELECT
                    mfsn.note
                    FROM
                    membership_fee_stage_notes AS mfsn
                    WHERE
                    mfsn.membership_fees_id = mf.id AND mfsn.stage_id = 2
                    LIMIT 1
                ) AS latest_note,
                mf.payment_date as note_created_at,
                (
                    SELECT
                    mfsn.created_by
                    FROM
                    membership_fee_stage_notes AS mfsn
                    WHERE
                    mfsn.membership_fees_id = mf.id AND mfsn.stage_id = 2
                    LIMIT 1
                ) AS note_created_by      
                FROM
                membership_fees AS mf
                JOIN
                members AS m ON mf.membership_number = m.membership_number
                WHERE
                mf.completed = 0
                AND EXISTS (
                    SELECT
                    1
                    FROM
                    membership_fee_stage_notes AS mfsn
                    WHERE
                    mfsn.membership_fees_id = mf.id AND mfsn.stage_id = 2
                )
                AND NOT EXISTS (
                    SELECT
                    1
                    FROM
                    membership_fee_stage_notes AS mfsn
                    WHERE
                    mfsn.membership_fees_id = mf.id AND mfsn.stage_id = 4     
                )
                ORDER BY mf.payment_date DESC
                LIMIT 50`
            )
            .all<{
                id: number;
                membership_number: string;
                year: number;
                amount: number;
                payment_date: string;
                completed: number;
                first_name: string;
                last_name: string;
                chinese_name: string;
                latest_note: string;
                note_created_at: string;
                note_created_by: string;
                current_stage: string;
            }>();
        return result;
    }

    async getUnrecordedMembershipFees() {
        const results = await this.db
            .prepare(
                `SELECT
                mf.id,
                mf.membership_number,
                mf.year,
                mf.amount,
                mf.payment_date,
                mf.completed,
                m.first_name,
                m.last_name,
                m.chinese_name
                FROM
                membership_fees AS mf
                JOIN
                members AS m ON mf.membership_number = m.membership_number
                WHERE
                mf.completed = 0
                AND NOT EXISTS (
                    SELECT
                    1
                    FROM
                    membership_fee_stage_notes AS mfsn
                    WHERE
                    mfsn.membership_fees_id = mf.id AND mfsn.stage_id = 5
                )
                ORDER BY mf.payment_date DESC
                LIMIT 50`
            )
            .all<{
                id: number;
                membership_number: string;
                year: number;
                amount: number;
                payment_date: string;
                completed: number;
                first_name: string;
                last_name: string;
                chinese_name: string;                
            }>();

        return results;
    }
}
