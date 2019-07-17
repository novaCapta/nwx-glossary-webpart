import { IUserInfo } from '../../core/IUserInfo';
import { IUserProfileService } from '../../core/IUserProfileService';
/**
 * @interface
 * This interface serves as the react component properties which gets
	passed to the component PersonaCard.
 */
export interface IPersonaCardProps {
    userInfo: IUserInfo;
    userProfileService: IUserProfileService;
}