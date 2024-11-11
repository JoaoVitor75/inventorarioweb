import { UserData } from "./UserData";

export interface AuthContextType {
    user:  UserData | null;
    signed: boolean;
    signin: (email: string, password: string) => string | void;
    signup: (email: string, password: string) => string | void;
    signout: () => void;
  }