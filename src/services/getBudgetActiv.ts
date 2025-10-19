import { GetBudgetActiv } from "../API_END_POINTS/AchatModuleEndPoints";


export async function getBudgetActiv() {
    try {
        const response = await fetch(GetBudgetActiv, {
            method: 'POST',
            headers: new Headers({ "Authorization": `Basic ${btoa(`Achat_Mod_24:Achat$$Mod*%24`)}`, 'Content-Type': 'application/json', 'Accept': '*/*' }),
        });
        const data = await response.json();
        return data
    } catch (error) {
        console.log(error);
    }
}
