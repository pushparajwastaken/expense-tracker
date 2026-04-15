export function success(data: unknown, status = 200) {
  return Response.json({ success: true, data }, { status });
}
export function error(message: string, status = 400) {
  return Response.json(
    { success: false, message },
    {
      status,
    },
  );
}
