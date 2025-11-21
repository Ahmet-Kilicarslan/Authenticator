import bcrypt from 'bcrypt';


class PasswordService {

    async hashPassword(password: string):Promise<string> {
        const saltRounds: number = 10;
        return await bcrypt.hash(password, saltRounds);

    }

    async comparePassword(plainPassword: string, hashedPassword: string):Promise<boolean> {

        return await bcrypt.compare(plainPassword, hashedPassword);



    }

    async validateStrength(password: string): Promise<{ strong: boolean, errors: string[] }> {
        const errors: string[] = [];

        if (password.length < 6) {
            errors.push('Password must be at least 6 characters');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain an uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must  contain a lowercase letter');
        }

        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain a number');
        }

        

        return {
            strong: errors.length === 0,
            errors
        };


    }

}

export default PasswordService;