import React from "react";
import * as ink from "ink";

export const App: React.FC = () => {
  const { exit } = ink.useApp();

  ink.useInput((input, key) => {
    if (key.ctrl && input === "c") {
      exit();
    }
  });

  return (
    <ink.Box>
      <ink.Text>Hello, World!</ink.Text>
    </ink.Box>
  );
};
