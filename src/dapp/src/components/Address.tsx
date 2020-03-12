import React, { Fragment, useState } from "react";
import { Label, Popup } from "semantic-ui-react";
import { formatAccount } from "../common/utils";

export const Address: React.FC<{ value: string }> = ({ value }) => {
  const [popup, setPopup] = useState("Click to copy");

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
      trigger={<Label as='a' onClick={() => setPopup("Copied!")}>{formatAccount(value)}</Label>}
    />
  </Fragment>;
};
