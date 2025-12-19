import type {RedisClient} from '../config/redis.js';
import type {PendingRegistration} from '../types'


 class PendingRegistrationService {

    private redisClient: RedisClient;
    private readonly PENDING_PREFIX = 'pending:registration:';
    private readonly EXPIRY = 900;


    constructor( redisClient: RedisClient) {
        this.redisClient = redisClient;
    }


    async storePending(data:PendingRegistration): Promise<void> {
        const key = `${this.PENDING_PREFIX}${data.email}`;

        await this.redisClient.set(
            key,
            JSON.stringify(data),
            {EX:this.EXPIRY});


    }


    async getPending(email:string): Promise<PendingRegistration | null> {
        const key = `${this.PENDING_PREFIX}${email}`;
        const data = await this.redisClient.get(key);

        if(!data){
            return null;
        }
        return  JSON.parse(data) as PendingRegistration;
    }

    async deletePending(email:string): Promise<void> {
        const key = `${this.PENDING_PREFIX}${email}`;
        await this.redisClient.del(key);


    }

    async exists(email:string): Promise<boolean> {
        const key = `${this.PENDING_PREFIX}${email}`;
        return (await this.redisClient.exists(key)) === 1;
    }




}export default PendingRegistrationService;