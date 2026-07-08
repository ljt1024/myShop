export function ok(data = null, message = 'success') {
  return { code: 200, message, data };
}

export function page(list, pagination, message = 'success') {
  return ok({ list, pagination }, message);
}

export function fail(message = '参数错误', code = 400, data = null) {
  return { code, message, data };
}
