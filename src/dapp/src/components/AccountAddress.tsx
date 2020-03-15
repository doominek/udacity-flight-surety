import React, { Fragment, useState } from "react";
import { Label, Popup } from "semantic-ui-react";
import copy from 'copy-to-clipboard';

import { formatAccount } from "../common/utils";

export const AccountAddress: React.FC<{ value: string }> = ({ value }) => {
  const [popup, setPopup] = useState("Click to copy");

  const copyToClipboard = () => {
    console.log('Trying to copy to clipboard', value);
    const copied = copy(value, { debug: true });
    if (copied) {
      setPopup("Copied!");
    }
  };

  return <Fragment>
    <Popup
      content={popup}
      position='bottom center'
      mouseEnterDelay={300}
      mouseLeaveDelay={300}
      onClose={() => setPopup("Click to copy")}
      on='hover'
      inverted
      size='tiny'
      trigger={<Label as='a' onClick={copyToClipboard}>{formatAccount(value)}</Label>}
    />
  </Fragment>;
};
