/* Number for return type just works fine .
   Apparently string is industry standard */
const generateOTP = () => {
    const min = 100000;
    const max = 1000000;
    return (Math.floor(Math.random() * (max - min)) + min).toString();
};
export default generateOTP;
//# sourceMappingURL=otpGenerator.js.map