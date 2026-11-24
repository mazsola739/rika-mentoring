// A few hundred passwords that people choose again and again, so they turn up in leaked password lists
// all the time. We only need this list in the advanced level of the lesson.
// Every entry is lowercase: compare it with lowercase text.
export const COMMON_PASSWORDS = [
  // Numbers
  '123456', '123456789', '12345678', '12345', '1234567', '1234567890', '1234', '123', '123123', '1231234',
  '111111', '000000', '654321', '666666', '121212', '112233', '123321', '777777', '7777777', '888888',
  '999999', '555555', '11111111', '00000000', '987654321', '1111', '0000', '2000', '159753', '147258369',
  '123654', '131313', '102030', '010203', '147258', '789456', '741852963', '12341234', '11223344', '10203040',
  '696969', '232323', '1212', '2580', '5555', '9999', '1004', '7777', '159357', '0123456789',

  // Keyboard patterns
  'qwerty', 'qwerty1', 'qwerty12', 'qwerty123', 'qwertyuiop', 'qwert', 'qwer1234', 'qwerasdf', 'asdf', 'asdfgh',
  'asdfghjkl', 'asd123', 'asdasd', 'zxcvbn', 'zxcvbnm', 'zxcv', 'zxczxc', 'qazwsx', 'qazxsw', 'qweasd',
  'qweasdzxc', 'qweqwe', '1qaz2wsx', 'zaq12wsx', 'zaq1zaq1', '1qazxsw2', '12qwaszx', '1q2w3e', '1q2w3e4r',
  '1q2w3e4r5t', '1q2w3e4r5t6y', 'q1w2e3', 'q1w2e3r4', '123qwe', '1234qwer', 'azerty', 'qwertz', 'aaaaaa',
  'aaaaaaaa', 'zzzzzz', 'xxxxxx', 'abc', 'abcdef', 'abcabc', 'abc123', 'abc12345', 'abc123456', 'abcd1234',
  'a1b2c3', '1a2b3c', '123abc', 'a123456', '123456a', 'aa123456', 'qwerty7', 'asdf1234', 'zxcvbnm1', 'qazwsxedc',

  // The word "password" and its friends
  'password', 'password1', 'password12', 'password123', 'password!', 'passw0rd', 'p@ssw0rd', 'p@ssword', 'pass',
  'pass123', 'pass1234', 'pass@123', 'passpass', 'mypassword', 'newpassword', 'password2024', 'password2025',
  'passwort', 'motdepasse', 'contrasena', 'senha', 'parola', 'haslo', 'wachtwoord', 'salasana',

  // Admin and test accounts
  'admin', 'admin1', 'admin123', 'admin@123', 'administrator', 'root', 'root123', 'toor', 'login', 'guest',
  'user', 'user123', 'test', 'test1', 'test123', 'testing', 'default', 'changeme', 'secret', 'secret123',
  'letmein', 'letmein1', 'welcome', 'welcome1', 'welcome2', 'welcome123', 'access', 'master', 'temp', 'demo',
  'system', 'server', 'oracle', 'mysql', 'office', 'company', 'business', 'work', 'manager', 'support',

  // Feelings and sweet words
  'iloveyou', 'iloveyou1', 'iloveu', 'loveyou', 'love', 'love123', 'lovely', 'loveme', 'lover', 'trustno1',
  'whatever', 'nothing', 'hello', 'hello123', 'hellokitty', 'freedom', 'forever', 'happy', 'smile', 'heaven',
  'angel', 'angel1', 'baby', 'baby123', 'babygirl', 'sweet', 'sweetheart', 'beautiful', 'friends', 'family',
  'jesus', 'blessed', 'faith', 'lucky', 'lucky7', 'money', 'money123', 'cash', 'secret1', 'princess',
  'princess1', 'sunshine', 'sunshine1', 'rainbow', 'unicorn', 'butterfly', 'flower', 'sunflower', 'star', 'stars',
  'superstar', 'rockstar', 'dream', 'dreamer', 'magic',

  // Heroes, games and films
  'superman', 'superman1', 'batman', 'spiderman', 'ironman', 'starwars', 'pokemon', 'pikachu', 'naruto',
  'minecraft', 'fortnite', 'roblox', 'zelda', 'mario', 'matrix', 'shadow', 'shadow1', 'dragon', 'dragon1',
  'ninja', 'wizard', 'merlin', 'phoenix', 'legend', 'player', 'gamer', 'hunter', 'ranger', 'killer',
  'pirate', 'cowboy', 'bandit', 'snoopy', 'garfield', 'scooby', 'mickey', 'minnie', 'donald', 'blink182',

  // Animals, food and seasons
  'monkey', 'monkey1', 'tiger', 'lion', 'eagle', 'dolphin', 'kitten', 'puppy', 'buster', 'tigger',
  'chicken', 'cookie', 'cheese', 'chocolate', 'pepper', 'ginger', 'peanut', 'banana', 'orange', 'apple',
  'apple123', 'summer', 'winter', 'spring', 'autumn', 'summer2024', 'winter2024', 'summer2025', 'spring2025',
  'monday', 'friday', 'sunday', 'january', 'october', 'november', 'december',

  // Sports, cars and places
  'football', 'football1', 'baseball', 'basketball', 'soccer', 'hockey', 'tennis', 'golf', 'jordan', 'jordan23',
  'liverpool', 'chelsea', 'arsenal', 'barcelona', 'realmadrid', 'manchester', 'juventus', 'yankees', 'dallas',
  'mustang', 'ferrari', 'porsche', 'mercedes', 'harley', 'corvette', 'thunder', 'lightning', 'silver', 'golden',
  'diamond', 'london', 'paris', 'berlin', 'america', 'canada', 'austin',

  // First names
  'michael', 'michael1', 'jennifer', 'jessica', 'ashley', 'amanda', 'daniel', 'joshua', 'andrew', 'charlie',
  'charlie1', 'robert', 'thomas', 'michelle', 'nicole', 'matthew', 'anthony', 'william', 'george', 'maggie',
  'taylor', 'hannah', 'samantha', 'jasmine', 'justin', 'david', 'james', 'alex', 'anna', 'maria',

  // Computers and websites
  'computer', 'internet', 'samsung', 'iphone', 'android', 'google', 'yahoo', 'facebook', 'linkedin', 'twitter',
  'myspace', 'windows', 'linux', 'ubuntu', 'hacker', 'hacked', 'security', 'network', 'bitcoin', 'qwerty2024',

  // Hungarian favourites
  'jelszo', 'jelszo1', 'jelszo123', 'jelszavam', 'szeretlek', 'macska', 'cica', 'kutya', 'kiskutya', 'nyuszi',
  'maci', 'almafa', 'virag', 'csillag', 'napsugar', 'titok', 'budapest', 'magyar', 'magyarorszag', 'hungary',
  'ferencvaros', 'fradi', 'debrecen', 'szeged', 'tavasz',
]
