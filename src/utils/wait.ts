function wait(timeout: number) {
  return new Promise<void>((res) => setTimeout(res, timeout));
}

export { wait };
