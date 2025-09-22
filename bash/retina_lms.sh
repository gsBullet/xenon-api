#!/bin/bash

artifact="LmsRetina"
tmp_dir="/tmp/deploy-$(date +'%m-%d-%y')"
dest_ip="54.179.217.68"
ssh_addr=""
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
scp -i "../keys/classroom_dev_key.pem" "$tmp_dir/$artifact.zip" ubuntu@$dest_ip:~/.
ssh -i "../keys/classroom_dev_key.pem" ubuntu@$dest_ip unzip -o LmsRetina.zip
ssh -i "../keys/classroom_dev_key.pem" ubuntu@$dest_ip

status=$?