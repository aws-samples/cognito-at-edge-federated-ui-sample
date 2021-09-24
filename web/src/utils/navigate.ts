// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
type DomEvent = {
  preventDefault?: () => void,
};

const navigate = (
  history: { push: (url: string) => void },
  event?: DomEvent,
  href?: string
): void => {
  if (event?.preventDefault) { event.preventDefault(); }


  if (href !== undefined) { history.push(href); }

};

export { navigate };