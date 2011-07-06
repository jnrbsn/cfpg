<?php
/**
 * Carpus Friendly Password Generator.
 *
 * The Carpus Friendly Password Generator uses a quantitative typing effort model to generate secure
 * passwords that are measurably easy-to-type (a.k.a. carpus friendly) on standard QWERTY keyboards.
 * Typing effort of the generated passwords is calculated based on the CarpalX Typing Effort Model
 * <http://mkweb.bcgsc.ca/carpalx/?typing_effort>. Some of the logic used in CFPG was derived from
 * code in CarpalX which is copyright 2002-2009 Martin Krzywinski <martink@bcgsc.ca>.
 *
 * PHP version 5
 *
 * @author    Jonathan Robson <jnrbsn@gmail.com>
 * @copyright 2011 Jonathan Robson
 * @license   MIT License http://gist.github.com/802399
 * @link      http://github.com/jnrbsn/cfpg
 */


/**
 * Generates a secure, easy-to-type password for QWERTY keyboards.
 *
 * @param integer $length       The number of characters to be in the password.
 * @param float   $maxEffort    The maximum typing effort the password should have.
 * @param boolean $returnEffort Whether or not to return the typing effort along with the password.
 *
 * @return mixed The password or an array containing the password and the effort if $returnEffort
 *               is set to true.
 */
function cfpg($length=8, $maxEffort=4.362, $returnEffort=false)
{
    // Pool of characters from which to generate the password.
    $pool = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz123456789!@#$%^&*()-=[];,./_+{}:<>?';
    // Shift key map. "~" is left shift. "|" is right shift.
    $shiftMap = array(
        '!' => '~1', '@' => '~2', '#' => '~3', '$' => '~4', '%' => '~5', '^' => '~6', '&' => '|7',
        '*' => '|8', '(' => '|9', ')' => '|0', '_' => '|-', '+' => '|=', 'Q' => '~q', 'W' => '~w',
        'E' => '~e', 'R' => '~r', 'T' => '~t', 'Y' => '|y', 'U' => '|u', 'P' => '|p', '{' => '|[',
        '}' => '|]', 'A' => '~a', 'S' => '~s', 'D' => '~d', 'F' => '~f', 'G' => '~g', 'H' => '|h',
        'J' => '|j', 'K' => '|k', 'L' => '|l', ':' => '|;', 'Z' => '~z', 'X' => '~x', 'C' => '~c',
        'V' => '~v', 'B' => '~b', 'N' => '|n', 'M' => '|m', '<' => '|,', '>' => '|.', '?' => '|/',
    );
    // Each element: key => array(distance, penalty, hand, row, finger).
    $keyData = array(
        '1' => array(5,   3.2606, 0, 0, 1), '2' => array(4,   3.2606, 0, 0, 1),
        '3' => array(4,   1.9632, 0, 0, 2), '4' => array(4,   1.9632, 0, 0, 3),
        '5' => array(3.5, 1.9632, 0, 0, 3), '6' => array(4.5, 1.9632, 0, 0, 3),
        '7' => array(4,   1.9632, 1, 0, 6), '8' => array(4,   1.9632, 1, 0, 7),
        '9' => array(4,   1.9632, 1, 0, 7), '0' => array(4,   3.2606, 1, 0, 8),
        '-' => array(4,   4.558,  1, 0, 9), '=' => array(4.5, 4.558,  1, 0, 9),
        'q' => array(2,   3.2492, 0, 1, 0), 'w' => array(2,   1.9518, 0, 1, 1),
        'e' => array(2,   0.6544, 0, 1, 2), 'r' => array(2,   0.6544, 0, 1, 3),
        't' => array(2.5, 0.6544, 0, 1, 3), 'y' => array(3,   0.6544, 1, 1, 6),
        'u' => array(2,   0.6544, 1, 1, 6), 'i' => array(2,   0.6544, 1, 1, 7),
        'p' => array(2,   3.2492, 1, 1, 9), '[' => array(2.5, 3.2492, 1, 1, 9),
        ']' => array(4,   3.2492, 1, 1, 9), 'a' => array(0,   2.5948, 0, 2, 0),
        's' => array(0,   1.2974, 0, 2, 1), 'd' => array(0,   0,      0, 2, 2),
        'f' => array(0,   0,      0, 2, 3), 'g' => array(2,   0,      0, 2, 3),
        'h' => array(2,   0,      1, 2, 6), 'j' => array(0,   0,      1, 2, 6),
        'k' => array(0,   0,      1, 2, 7), 'l' => array(0,   1.2974, 1, 2, 8),
        ';' => array(0,   2.5948, 1, 2, 9), 'z' => array(2,   3.9036, 0, 3, 0),
        'x' => array(2,   2.6062, 0, 3, 1), 'c' => array(2,   1.3088, 0, 3, 2),
        'v' => array(2,   1.3088, 0, 3, 3), 'b' => array(3.5, 1.3088, 0, 3, 3),
        'n' => array(2,   1.3088, 1, 3, 6), 'm' => array(2,   1.3088, 1, 3, 6),
        ',' => array(2,   1.3088, 1, 3, 7), '.' => array(2,   2.6062, 1, 3, 8),
        '/' => array(2,   3.9036, 1, 3, 9), '~' => array(4,   3.9036, 0, 3, 0),
        '|' => array(4,   3.9036, 1, 3, 9),
    );

    // Generate the first draft of the password.
    $password = '';
    for ($i = 0; $i < $length; ++$i) {
        $password .= $pool[mt_rand(0, 82)];
    }

    // This will store cached effort calculations for triads to improve efficiency.
    $effortCache = array();

    do {
        // Replace a random character in the password.
        $password[mt_rand() % $length] = $pool[mt_rand(0, 82)];

        // Translate all the keys that need shift.
        $keys = strtr($password, $shiftMap);
        // Get the total number of triads.
        $numTriads = strlen($keys) - 2;
        // This will store the overall effort of the password.
        $totalEffort = 0;

        for ($i = 0; $i < $numTriads; ++$i) {
            $c1 = $keys[$i];
            $c2 = $keys[$i + 1];
            $c3 = $keys[$i + 2];
            $triad = $c1.$c2.$c3;

            if (isset($effortCache[$triad])) {
                // Don't calculate the effort of this triad if we already know it.
                $totalEffort += $effortCache[$triad];
                continue;
            }

            // Base distances and penalties.
            $triadEffort  = 0.3555 * $keyData[$c1][0] *
                (1 + 0.367 * $keyData[$c2][0] * (1 + 0.235 * $keyData[$c3][0]));
            $triadEffort += 0.6423 * $keyData[$c1][1] *
                (1 + 0.367 * $keyData[$c2][1] * (1 + 0.235 * $keyData[$c3][1]));

            // Hand penalty calculation.
            if ($keyData[$c1][2] == $keyData[$c3][2]) {
                if ($keyData[$c2][2] == $keyData[$c3][2]) {
                    // Same hand.
                    $pHand = 2;
                } else {
                    // Alternating.
                    $pHand = 1;
                }
            } else {
                // Both used, not alternating.
                $pHand = 0;
            }

            // Row penalty calculation.
            $row1  = $keyData[$c1][3];
            $row2  = $keyData[$c2][3];
            $row3  = $keyData[$c3][3];
            $dr    = array($row1 - $row2, $row1 - $row3, $row2 - $row3);
            $drAbs = array(abs($dr[0]), abs($dr[1]), abs($dr[2]));
            arsort($drAbs);
            // Max delta row absolute value.
            $drMaxAbs = reset($drAbs);
            // Max delta row.
            $drMax = $dr[key($drAbs)];
            unset($dr, $drAbs);
            if ($row1 < $row2) {
                if ($row3 == $row2) {
                    // Downward progression with repetition: 1 < 2 = 3.
                    $pRow = 1;
                } else if ($row2 < $row3) {
                    // Downward progression: 1 < 2 < 3.
                    $pRow = 4;
                } else if ($drMaxAbs == 1) {
                    $pRow = 3;
                } else {
                    // All/some different; delta row > 1.
                    if ($drMax < 0) {
                        $pRow = 7;
                    } else {
                        $pRow = 5;
                    }
                }
            } else if ($row1 > $row2) {
                if ($row3 == $row2) {
                    // Upward progression with repetition: 1 > 2 = 3.
                    $pRow = 2;
                } else if ($row2 > $row3) {
                    // Upward progression: 1 > 2 > 3.
                    $pRow = 6;
                } else if ($drMaxAbs == 1) {
                    $pRow = 3;
                } else {
                    if ($drMax < 0) {
                        $pRow = 7;
                    } else {
                        $pRow = 5;
                    }
                }
            } else {
                if ($row2 > $row3) {
                    // Upward progression with repetition: 1 = 2 > 3.
                    $pRow = 2;
                } else if ($row2 < $row3) {
                    // Downward progression with repetition: 1 = 2 < 3.
                    $pRow = 1;
                } else {
                    // All same.
                    $pRow = 0;
                }
            }//end if

            unset($drMax, $drMaxAbs);

            // Finger penalty calculation.
            $finger1 = $keyData[$c1][4];
            $finger2 = $keyData[$c2][4];
            $finger3 = $keyData[$c3][4];
            if ($finger1 > $finger2) {
                if ($finger2 > $finger3) {
                    // Monotonic; all different: 1 > 2 > 3.
                    $pFinger = 0;
                } else if ($finger2 == $finger3) {
                    // Monotonic; some different: 1 > 2 = 3.
                    if ($c2 == $c3) {
                        $pFinger = 1;
                    } else {
                        $pFinger = 6;
                    }
                } else if ($finger3 == $finger1) {
                    $pFinger = 4;
                } else if ($finger1 > $finger3 && $finger3 > $finger2) {
                    // Rolling.
                    $pFinger = 2;
                } else {
                    // Not monotonic; all different.
                    $pFinger = 3;
                }
            } else if ($finger1 < $finger2) {
                if ($finger2 < $finger3) {
                    // Monotonic; all different: 1 < 2 < 3.
                    $pFinger = 0;
                } else if ($finger2 == $finger3) {
                    if ($c2 == $c3) {
                        // Monotonic; some different: 1 < 2 = 3.
                        $pFinger = 1;
                    } else {
                        $pFinger = 6;
                    }
                } else if ($finger3 == $finger1) {
                    // Not monotonic; some different: 1 = 3 < 2.
                    $pFinger = 4;
                } else if ($finger1 < $finger3 && $finger3 < $finger2) {
                    // Rolling.
                    $pFinger = 2;
                } else {
                    // Not monotonic; all different.
                    $pFinger = 3;
                }
            } else if ($finger1 == $finger2) {
                if ($finger2 < $finger3 || $finger3 < $finger1) {
                    // Monotonic; some different: 1 = 2 < 3, 3 < 1 = 2.
                    if ($c1 == $c2) {
                        $pFinger = 1;
                    } else {
                        $pFinger = 6;
                    }
                } else if ($finger2 == $finger3) {
                    if ($c1 != $c2 && $c2 != $c3 && $c1 != $c3) {
                        $pFinger = 7;
                    } else {
                        // All same.
                        $pFinger = 5;
                    }
                }
            }//end if

            // Stroke path effort.
            $triadEffort += 0.4268 * ($pHand + 0.3 * $pRow + 0.3 * $pFinger);

            $effortCache[$triad] = $triadEffort;
            $totalEffort += $triadEffort;
        }//end for

        $totalEffort = $totalEffort / $numTriads;
    } while ($totalEffort > $maxEffort
        || !preg_match('/[0-9]/', $password)
        || !preg_match('/[A-Z]/', $password)
        || !preg_match('/[a-z]/', $password)
        || !preg_match('/[^0-9A-Za-z]/', $password));

    if ($returnEffort === true) {
        return array($password, round($totalEffort, 1));
    } else {
        return $password;
    }

}//end cfpg()
