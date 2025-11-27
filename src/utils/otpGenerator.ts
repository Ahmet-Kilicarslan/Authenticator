

/* Number for return type just works fine .
   Apparently string is industry standard */

const generateOTP =  ():string=> {

    const min : number = 100000;
    const max : number = 1000000;

   return (Math.floor(Math.random() * (max - min )) + min).toString();
}

export default generateOTP;