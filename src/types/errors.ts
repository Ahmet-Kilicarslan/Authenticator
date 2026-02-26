export class EmailExistsError extends Error{

    constructor(){
        super('Email already exists!');
        this.name='EmailExistsError';
    }

}

export class UsernameExistsError extends Error{

    constructor(){
        super('Username already exists!');
        this.name='UsernameExistsError';
    }
}

export class WeakPasswordError extends Error{

    constructor(details:string){
        super(`Weak password: ${details}`);
        this.name='WeakPasswordError';
    }
}

export class IncorrectPasswordError extends Error{
    constructor(){
        super('Incorrect password');
    this.name='IncorrectPasswordError';
    }
}