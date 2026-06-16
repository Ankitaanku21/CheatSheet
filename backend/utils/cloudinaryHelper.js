const cloudinary = require('cloudinary').v2;

function getAuthenticatedUrl(cloudinaryUrl, options = {}) {
  const cleanUrl = cloudinaryUrl.replace(/\/s--[A-Za-z0-9_-]{8,}--\//, '/');
  const urlObj = new URL(cleanUrl);
  const segments = urlObj.pathname.split('/');

  const uploadIdx = segments.indexOf('upload');
  if (uploadIdx === -1) throw new Error('Not a Cloudinary upload URL');

  const resourceType = segments[uploadIdx - 1];
  const pathAfterVersion = segments.slice(uploadIdx + 2).join('/');

  if (resourceType === 'raw') {
    return cloudinary.utils.private_download_url(pathAfterVersion, '', {
      resource_type: 'raw',
      type: 'upload',
      attachment: !!options.attachment,
    });
  }

  const dotIdx = pathAfterVersion.lastIndexOf('.');
  const publicId = dotIdx > -1 ? pathAfterVersion.slice(0, dotIdx) : pathAfterVersion;
  const ext = dotIdx > -1 ? pathAfterVersion.slice(dotIdx + 1) : '';

  return cloudinary.utils.private_download_url(publicId, ext, {
    resource_type: 'image',
    type: 'upload',
    attachment: !!options.attachment,
  });
}

module.exports = { getAuthenticatedUrl };
