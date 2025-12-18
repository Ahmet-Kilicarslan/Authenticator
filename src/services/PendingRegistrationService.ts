import type {RedisClientType} from 'redis';
import type {RegisterDTO} from '../types'


 class PendingRegistrationService {

    private redisClient: RedisClientType;
    private readonly PENDING_PREFIX = 'pending:registration:';
    private readonly EXPIRY = 900;


    constructor( redisClient: RedisClientType) {
        this.redisClient = redisClient;
    }


    async storePendingRegistration(data:RegisterDTO): Promise<void> {
        const key = `${this.PENDING_PREFIX}${data.email}`;

        await this.redisClient.set(
            key,
            JSON.stringify(data),
            {EX:this.EXPIRY});


    }


    async getPendingRegistration(email:string): Promise<RegisterDTO | null> {
        const key = `${this.PENDING_PREFIX}${email}`;
        const data = await this.redisClient.get(key);

        if(!data){
            return null;
        }
        return  JSON.parse(data) as RegisterDTO;
    }

    async deletePendingRegistration(email:string): Promise<void> {
        const key = `${this.PENDING_PREFIX}${email}`;
        await this.redisClient.del(key);


    }

    async exists(email:string): Promise<boolean> {
        const key = `${this.PENDING_PREFIX}${email}`;
        return (await this.redisClient.exists(key)) === 1;
    }




}export default PendingRegistrationService;