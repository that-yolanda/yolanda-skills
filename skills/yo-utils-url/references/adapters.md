mp.weixin.qq.com	weixin	true	opencli weixin download --url "{url}" --output "{tmp}" --download-images {download_images} --format json
x.com	twitter	true	opencli twitter download --tweet-url "{url}" --output "{tmp}" --format json
twitter.com	twitter	true	opencli twitter download --tweet-url "{url}" --output "{tmp}" --format json
youtube.com	youtube	true	opencli youtube transcript "{url}" --format json
youtu.be	youtube	true	opencli youtube transcript "{url}" --format json
*	web	true	opencli web read --url "{url}" --output "{tmp}" --download-images {download_images} --format json
