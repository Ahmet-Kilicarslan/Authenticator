import pool from '../config/dbc.js'
import type {AuthProviderDTO} from "../types";

class AuthProviderRepository {

    async create(providerData: AuthProviderDTO): Promise<AuthProviderDTO> {

        const sql = `INSERT INTO auth_providers (user_id,
                                                 provider_name,
                                                 provider_user_id)
                     VALUES ($1, $2, $3)
                     RETURNING
                         user_id as "userId",
                         provider_name as "providerName",
                         provider_user_id as "providerUserId"
        `;

        const result = await pool.query(sql, [
            providerData.userId,
            providerData.providerName,
            providerData.providerUserId,]);

        return result.rows[0];


    }

    async findByProvider(providerId: string, providerName: string): Promise<AuthProviderDTO | null> {

        const sql = ` SELECT user_id          as "userId",
                             provider_name    as "providerName",
                             provider_user_id as "providerUserId"
                      FROM auth_providers
                      WHERE provider_user_id = $1
                        AND provider_name = $2`;

        const result = await pool.query(sql, [providerId, providerName]);


        return result.rows[0] || null;


    }


}