#!/bin/bash

artifact="LmsRetina"
tmp_dir="/tmp/deploy-$(date +'%m-%d-%y')"
ssh_addr=""
# making temporary directories
mkdir -vp "$tmp_dir"
status=$?
[[ ${status} -eq 0 ]] || exit ${status}
echo "Created $tmp_dir successfully"

rsync -vr \
--exclude 'node_modules' \
--exclude 'bash' \
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
scp -i "../keys/retina_lms.pem" "$tmp_dir/$artifact.zip" ubuntu@18.141.202.240:~/.
ssh -i "../keys/retina_lms.pem" ubuntu@18.141.202.240

status=$?