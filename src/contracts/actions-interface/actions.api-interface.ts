export interface IActionsCotroller {
  /**
   * Ads actions
   */
  sendLike: () => any;
  declineLike: () => any;
  approveLike: () => any;

  /**
   * Chat actions
   */
  sendMessage: () => any;
  sendMedia: () => any;

  /**
   * Media actions
   */
  givePrivatePhotoPermission: () => any;
  removePrivatePhotoPermission: () => any;
}
