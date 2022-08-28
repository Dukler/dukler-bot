ping -c1 $1 1>/dev/null 2>/dev/null
SUCCESS=$?

if [ $SUCCESS -eq 0 ]
then
  echo "$1 is alive"
else
  echo "$1 is dead"
fi
#EOF

