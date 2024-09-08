import { WebPartContext } from "@microsoft/sp-webpart-base";
import { MSGraphClientV3 } from "@microsoft/sp-http";
import { IPresence } from '../model/IPresence';

export default class GraphService {

    private context: WebPartContext;

    constructor(_context: WebPartContext) {
        this.context = _context;
    }

    /**
     * Gettinguser presence information
     * @param userId AAD user identity
     */
    public getPresence(userId: string): Promise<IPresence> {
        return new Promise<IPresence>((resolve, reject) => {
            this.context.msGraphClientFactory
                .getClient("3") // Init Microsoft Graph Client
                .then((client: MSGraphClientV3): Promise<IPresence> => {
                    return client
                        .api(`users/${userId}/presence`) //Get Presence method
                        .version("beta") // Beta version
                        .get((err, res) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            // Resolve presence object
                            resolve({
                                Availability: res.availability,
                                Activity: res.activity,
                            });
                        });
                });
        });
    }


    // Get user info by her ID
    public async getUserId(userUPN: string): Promise<string> {
        try {
          const client = await this.context.msGraphClientFactory.getClient("3");
          const res = await client
            .api(`users/${userUPN}`)
            .version("beta")
            .get();
            
          // Assuming 'res' is a string containing presence data
          return res;
        } catch (error) {
          throw error; // Re-throw the error
        }
    }

    // Get user data by her displayname
    public async getUserEmailByDisplayName(displayName: string): Promise<string> {
        try {
            const client = await this.context.msGraphClientFactory.getClient("3");
            
            // Filter query to search for the user by display name
            const res = await client
                .api('/users')
                .filter(`displayName eq '${displayName}'`)
                .version('beta')
                .get();
            
            // Assuming 'res' contains the user details
            if (res && res.value && res.value.length > 0) {
                return res.value[0].mail; // Assuming 'mail' is the property containing the user's email address
            } else {
                throw new Error('User not found');
            }
        } catch (error) {
            throw error; // Re-throw the error
        }
    }
}