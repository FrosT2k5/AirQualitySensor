import { createContext, useContext, useState } from "react";
import { onlineState } from "../../helpers";

type ConnectionContextType = {
  connectionState: onlineState;
  setConnectionState: React.Dispatch<React.SetStateAction<onlineState>>;
};

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const ConnectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [connectionState, setConnectionState] = useState<onlineState>(onlineState.loading);

  return (
    <ConnectionContext.Provider value={{ connectionState, setConnectionState }}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error("useConnection must be used within a ConnectionProvider");
  }
  return context;
};
