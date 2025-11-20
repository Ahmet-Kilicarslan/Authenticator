import pool from "../config/dbc.js";
class UserRepository {
    async create(userData) {
        const sql = `INSERT INTO users (username,
                                        email,
                                        password)
                     VALUES ($1, $2, $3)
                     RETURNING id,username,email,password,
                         is_verified as "isVerified",
                         created_at as "createdAt",
                         updated_at as "updatedAt"
        `;
        const result = await pool.query(sql, [
            userData.username,
            userData.email,
            userData.password,
        ]);
        return result.rows[0];
    }
    ;
    async getById(id) {
        const sql = `SELECT id,
                            username,
                            email,
                            password,
                            is_verified as "isVerified",
                            created_at  as "createdAt",
                            updated_at  as "updatedAt"
                     FROM users
                     WHERE id = $1`;
        const result = await pool.query(sql, [id]);
        return result.rows[0] || null;
    }
    ;
    async getByEmail(email) {
        const sql = `SELECT id,
                            username,
                            email,
                            password,
                            is_verified as "isVerified",
                            created_at  as "createdAt",
                            updated_at  as "updatedAt"
                     FROM users
                     WHERE email = $1`;
        const result = await pool.query(sql, [email]);
        return result.rows[0] || null;
    }
    ;
    async emailExists(email) {
        const sql = `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`;
        const result = await pool.query(sql, [email]);
        return result.rows[0].exists;
    }
    ;
    async usernameExists(username) {
        const sql = `SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)`;
        const result = await pool.query(sql, [username]);
        return result.rows[0].exists;
    }
    ;
}
export default UserRepository;
//# sourceMappingURL=UserRepository.js.map