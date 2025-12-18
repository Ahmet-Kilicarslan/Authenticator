import pool from "../config/dbc.js";
import type {User, RegisterDTO, UserDTO} from '../types';


class UserRepository {

    async create(userData: RegisterDTO): Promise<User> {

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
    };


    async getById(id: number): Promise<User | null> {
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
    };

    async getByEmail(email: string): Promise<User | null> {
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


    };


    async emailExists(email: string): Promise<boolean> {


        const sql = `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`;
        const result = await pool.query(sql, [email]);

        return result.rows[0].exists;
    };

    async usernameExists(username: string): Promise<boolean> {

        const sql = `SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)`;
        const result = await pool.query(sql, [username]);

        return result.rows[0].exists;
    };


    async getUserWithProfilePicById(id: number): Promise<UserDTO | null> {
        const sql = `SELECT username,
                            email,
                            url,
                            created_at as "createdAt"
                     FROM users
                              LEFT JOIN profile_pictures on users.id = profile_pictures.user_id
                     WHERE users.id = $1`;

        const result = await pool.query(sql, [id]);

        return result.rows[0];


    }


    async markAsVerified(email: string): Promise<boolean> {
        const sql = `UPDATE users
                     SET is_verified = true,
                     updated_at = CURRENT_TIMESTAMP
                     WHERE email = $1 `;

        const result = await pool.query(sql, [email]);

        return result.rowCount !== null && result.rowCount > 0;
    }

    async resetPassword(password:string,email:string): Promise<void> {

        const sql = `UPDATE users SET password = $1 WHERE email = $2`

        const result = await pool.query(sql, [password, email]);

        return result.rows[0];
    }


}


export default UserRepository;