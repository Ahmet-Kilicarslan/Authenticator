import pool from "../config/dbc";


class UserRepository {


    async assignUserRole(userId: number, roleId: number): Promise<void> {
        const sql = `INSERT INTO user_roles(user_id, role_id)
                     VALUES ($1, $2) `;

        await pool.query(sql, [userId, roleId]);


    }

    async getUserPermissions(userId: number): Promise<string[]> {

        const sql = `SELECT permissions.name
                     FROM user_roles
                              JOIN role_permissions on user_roles.role_id = role_permissions.role_id
                              JOIN permissions on role_permissions.permission_id = permissions.id
                     WHERE user_roles.user_id = $1


        `;

        const result = await pool.query(sql, [userId]);


        return result.rows.map(row => row.name);


    }

    async getUserRole(userId: number): Promise<string[]> {

        const sql = `SELECT roles.name
                     FROM user_roles
                              JOIN roles on user_roles.role_id = roles.id
                              WHERE user_roles.user_id = $1`;

        const result = await pool.query(sql,[userId])

        return result.rows.map(row=>row.name);

    }


}

export default UserRepository;