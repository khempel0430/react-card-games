import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import React, { useState } from 'react';

export interface IRulesDialogProps {
  decks?: number;
  initialLayout?: string;
  objective?: string;
  play?: string;
  rulesLink?: string;
  rulesLinkName?: string;
}

const RulesDialog: React.FC<IRulesDialogProps> = ({
  decks = 1,
  initialLayout,
  objective,
  play,
  rulesLink,
  rulesLinkName
}) => {
  const [showRulesDialog, setShowRulesDialog] = useState(false);

  const handleRules = () => {
    setShowRulesDialog(true);
  };

  const numberOfDecksText = decks === 1 ? 'One standard deck of 52 playing cards.' : `${decks} standard decks of 52 playing cards each.`;

  return (
    <>
      <Button label="Rules" onClick={handleRules} />
      <Dialog 
        header="Rules" 
        visible={showRulesDialog} 
        onHide={() => setShowRulesDialog(false)}
        modal
      >
        <div className="rules-content">
          <h3>Decks Involved</h3>
          <p>{numberOfDecksText}</p>

          <h3>Initial Layout</h3>
          <p>{initialLayout}</p>
          
          <h3>Objective</h3>
          <p>{objective}</p>
          
          <h3>Play</h3>
          <p>{play}</p>

          <p><small>Complete rules from: <a href={rulesLink} target="_blank" rel="noopener noreferrer">{rulesLinkName}</a></small></p>
        </div>
      </Dialog>
    </>
  );
}

export default RulesDialog;
