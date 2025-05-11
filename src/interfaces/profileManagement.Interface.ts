export interface iUpdateProfileParam {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
}

export interface iForgotPasswordParam {
  email: string;
}

export interface iResetPasswordParam {
  email: string;
  reset_token: string;
  new_password: string;
}

export interface iChangePasswordParam {
  id: string;
  current_password: string;
  new_password: string;
}

export interface iUploadProfilePictureParam {
  id: string;
  file: Express.Multer.File;
}

export interface iVerifyResetTokenParam {
  email: string;
  reset_token: string;
}
