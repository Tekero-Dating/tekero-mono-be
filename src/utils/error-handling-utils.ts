export const TekeroError = (error: Record<string, any>) => {
  if (!error) {
    return {
      status: 500,
      message: 'Uncaught error appeared'
    }
  }
  const getMessage = (err: typeof error) => {
    if (err.message) {
      return err.message;
    }
    if (err.response) {
      return typeof err.response === 'string'
        ? err.response
        : err.response.message
          ? err.response.message
          : 'Uncaught error appeared';
    }
    return 'Uncaught error appeared';
  };

  const getStatus = (err: typeof error) => {
    if (err.status) {
      return err.status
    }
    if (err.statusCode) {
      return err.statusCode;
    }
    if (err.response) {
      return typeof err.response?.status === 'number'
        ? err.response.status
        : err.response?.statusCode === 'number'
          ? err.response.statusCode
          : 500
    }
    return 500
  }


  return {
    status: getStatus(error),
    message: getMessage(error)
  }
}
