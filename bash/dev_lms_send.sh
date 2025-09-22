#!/bin/bash

artifact="LmsRetina"
tmp_dir="/tmp/deploy-$(date +'%m-%d-%y')"
dest_ip="13.214.209.194"
zip_artifact="LmsRetinaDev"

rm -rf temp

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

mv "$tmp_dir/$artifact/" "$tmp_dir/$zip_artifact"
rm -rf $tmp_dir/$zip_artifact/$artifact
[[ ${status} -eq 0 ]] || exit ${status}
echo "Copied source directory to: $tmp_dir/$artifact/"

# create zip archive
cd "$tmp_dir" || exit $?
zip -vr "$zip_artifact.zip" "$zip_artifact/"
status=$?
cd - || exit $?

[[ ${status} -eq 0 ]] || exit ${status}
echo "Created zip archive: $tmp_dir/$zip_artifact.zip"

# copy to remote
scp -i "~/.ssh/classroom_dev_key.pem" "$tmp_dir/$zip_artifact.zip" ubuntu@$dest_ip:~/.
rm -rf temp
ssh -i "~/.ssh/classroom_dev_key.pem" ubuntu@$dest_ip unzip -o LmsRetinaDev
ssh -i "~/.ssh/classroom_dev_key.pem" ubuntu@$dest_ip

status=$?