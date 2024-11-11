import { AuthContextType } from "@/@types/AuthContextType";
import { AuthProviderProps } from "@/@types/AuthProviderProps";
import { UserData } from "@/@types/UserData";


import { createContext, useEffect, useState } from "react";


export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const userToken = localStorage.getItem("user_token");
    const usersStorage = localStorage.getItem("users_bd");

    if (userToken && usersStorage) {
      const hasUser = JSON.parse(usersStorage)?.filter(
        (user: UserData) => user.email === JSON.parse(userToken).email
      );

      if (hasUser?.length) setUser(hasUser[0]);
    }
  }, []);

  const signin = (email: string, password: string): string | void => {
    const usersStorage = JSON.parse(localStorage.getItem("users_bd") || "[]");

    const hasUser = usersStorage?.filter((user: UserData) => user.email === email);

    if (hasUser?.length) {
      if (hasUser[0].email === email && hasUser[0].password === password) {
        const token = Math.random().toString(36).substring(2);
        localStorage.setItem("user_token", JSON.stringify({ email, token }));
        setUser({ id: 0, nome: hasUser[0].nome, email, password });
        return;
      } else {
        return "E-mail ou senha incorretos";
      }
    } else {
      return "Usuário não cadastrado";
    }
  };
  const signup = (email: string, password: string): string | void => {
    const usersStorage = JSON.parse(localStorage.getItem("users_bd") || "[]");

    const hasUser = usersStorage?.filter((user: UserData) => user.email === email);

    if (hasUser?.length) {
      return "Já tem uma conta com esse E-mail";
    }

    const newUser = usersStorage ? [...usersStorage, { email, password }] : [{ email, password }];
    localStorage.setItem("users_bd", JSON.stringify(newUser));
  };

  const signout = (): void => {
    setUser(null);
    localStorage.removeItem("user_token");
  };

  
  return (
    <AuthContext.Provider
      value={{ 
        user, 
        signed: !!user, 
        signin, 
        signup, 
        signout 
      } as AuthContextType}
    >
      {children}
    </AuthContext.Provider>
  );
};