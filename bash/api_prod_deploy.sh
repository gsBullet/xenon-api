#!/bin/bash

artifact="LmsRetina"
tmp_dir="/tmp/deploy-$(date +'%m-%d-%y')"
dest_ip="13.214.6.150"

# making temporary directories
mkdir -vp "$tmp_dir"
status=$?
[[ ${status} -eq 0 ]] || exit ${status}
echo "Created $tmp_dir successfully"

rsync -vr \
--exclude 'node_modules' \
--exclude '.gitignore' \
--exclude '*.env' \
--exclude '*.sh' \
--exclude 'logs' \
"../$artifact" "$tmp_dir/"
status=$?

[[ ${status} -eq 0 ]] || exit ${status}
echo "Copied source directory to: $tmp_dir/$artifact/"

# create zip archive
cd "$tmp_dir" || exit $?
zip -vr "$artifact.zip" "$artifact/"
status=$?
cd - || exit $?

[[ ${status} -eq 0 ]] || exit ${status}
echo "Created zip archive: $tmp_dir/$artifact.zip"

# copy to remote
scp -i "~/.ssh/retinalms_key_pair.pem" "$tmp_dir/$artifact.zip" ubuntu@$dest_ip:~/.
ssh -i "~/.ssh/retinalms_key_pair.pem" ubuntu@$dest_ip < ./bash/remote_prod.sh

status=$?