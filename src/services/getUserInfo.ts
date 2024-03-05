import { EmployeeInfoURL } from "../API_END_POINTS/AchatModuleEndPoints";


// GET all user info
export async function getUserInfo(establishment, registrationNumber) {
    try {
        const response = await fetch(EmployeeInfoURL+ registrationNumber + '/' + establishment);
        const data = await response.json();
        return data[0]
    } catch (error) {
        console.log(error);
    }
}