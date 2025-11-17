import pool from "../config/dbc";
import type {User, RegisterDTO} from '../types';


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


    async getById(id: number):Promise<User | null> {
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

    async getByEmail(email: string):Promise<User | null> {
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


    async emailExists(email: string):Promise<boolean> {


        const sql = `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`;
        const result = await pool.query(sql, [email]);

        return result.rows[0].exists;
    };

    async usernameExists(username: string):Promise<boolean> {

        const sql = `SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)`;
        const result = await pool.query(sql, [username]);

        return result.rows[0].exists;
    };
}


export default new UserRepository();