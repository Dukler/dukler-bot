ping -c1 $1 1>/dev/null 2>/dev/null
SUCCESS=$?

if [ $SUCCESS -eq 0 ]
then
  return 0
else
  return 1
fi
#EOF

