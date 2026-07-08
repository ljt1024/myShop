import { fail } from '../utils/response.js';

export function notFound(req, res) {
  res.status(404).json(fail(`接口不存在：${req.method} ${req.originalUrl}`, 404));
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  const status = err.status || 500;
  res.status(status).json(fail(err.message || '服务异常', status));
}
