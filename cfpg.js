var CFPG = {
    len: 8,
    eff: 4.362,
    load: function()
    {
        this.ps = document.getElementById('password');
        this.ls = document.getElementById('length-slider');
        this.lp = document.getElementById('length-pointer');
        this.es = document.getElementById('effort-slider');
        this.ep = document.getElementById('effort-pointer');
        this.ar = document.getElementById('arrow');
        this.bt = document.getElementById('button');
        this.bd = document.getElementById('button-disabled');
        var self = this;
        this.ls.onmousedown = function(e)
        {
            self.spl(e.clientX - self.ls.offsetLeft - 7);
            document.body.onmousemove = function(e)
            {
                self.spl(e.clientX - self.ls.offsetLeft - 7);
                return false;
            };
            document.body.onmouseup = function()
            {
                document.body.onmousemove = false;
                return false;
            };
            return false;
        };
        this.es.onmousedown = function(e)
        {
            self.sme(e.clientX - self.es.offsetLeft - 7);
            document.body.onmousemove = function(e)
            {
                self.sme(e.clientX - self.es.offsetLeft - 7);
                return false;
            };
            document.body.onmouseup = function()
            {
                document.body.onmousemove = false;
                return false;
            };
            return false;
        };
        this.spl(12);
        this.sme(106);
        this.clk();
    },
    clk: function()
    {
        this.bt.style.display = 'none';
        this.bd.style.display = 'block';
        var t = setTimeout('CFPG.gen()', 0);
    },
    gen: function()
    {
        var pool, shiftMap, keyData, password, i, effortCache, keys, numTriads, totalEffort,
            c1, c2, c3, triad, pHand, row1, row2, row3, drMaxAbs, drMax, pRow, finger1, finger2,
            finger3, pFinger;

        // Pool of characters from which to generate the password.
        pool = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz123456789!@#$%^&*()-=[];,./_+{}:<>?';
        // Shift key map. "~" is left shift. "|" is right shift.
        shiftMap = {
            '!': '~1', '@': '~2', '#': '~3', '$': '~4', '%': '~5', '^': '~6', '&': '|7', '*': '|8',
            '(': '|9', ')': '|0', '_': '|-', '+': '|=', 'Q': '~q', 'W': '~w', 'E': '~e', 'R': '~r',
            'T': '~t', 'Y': '|y', 'U': '|u', 'P': '|p', '{': '|[', '}': '|]', 'A': '~a', 'S': '~s',
            'D': '~d', 'F': '~f', 'G': '~g', 'H': '|h', 'J': '|j', 'K': '|k', 'L': '|l', ':': '|;',
            'Z': '~z', 'X': '~x', 'C': '~c', 'V': '~v', 'B': '~b', 'N': '|n', 'M': '|m', '<': '|,',
            '>': '|.', '?': '|/'
        };
        // Each element: key => array(distance, penalty, hand, row, finger).
        keyData = {
            '1': [5,   3.2606, 0, 0, 1], '2': [4,   3.2606, 0, 0, 1], '3': [4,   1.9632, 0, 0, 2],
            '4': [4,   1.9632, 0, 0, 3], '5': [3.5, 1.9632, 0, 0, 3], '6': [4.5, 1.9632, 0, 0, 3],
            '7': [4,   1.9632, 1, 0, 6], '8': [4,   1.9632, 1, 0, 7], '9': [4,   1.9632, 1, 0, 7],
            '0': [4,   3.2606, 1, 0, 8], '-': [4,   4.558,  1, 0, 9], '=': [4.5, 4.558,  1, 0, 9],
            'q': [2,   3.2492, 0, 1, 0], 'w': [2,   1.9518, 0, 1, 1], 'e': [2,   0.6544, 0, 1, 2],
            'r': [2,   0.6544, 0, 1, 3], 't': [2.5, 0.6544, 0, 1, 3], 'y': [3,   0.6544, 1, 1, 6],
            'u': [2,   0.6544, 1, 1, 6], 'i': [2,   0.6544, 1, 1, 7], 'p': [2,   3.2492, 1, 1, 9],
            '[': [2.5, 3.2492, 1, 1, 9], ']': [4,   3.2492, 1, 1, 9], 'a': [0,   2.5948, 0, 2, 0],
            's': [0,   1.2974, 0, 2, 1], 'd': [0,   0,      0, 2, 2], 'f': [0,   0,      0, 2, 3],
            'g': [2,   0,      0, 2, 3], 'h': [2,   0,      1, 2, 6], 'j': [0,   0,      1, 2, 6],
            'k': [0,   0,      1, 2, 7], 'l': [0,   1.2974, 1, 2, 8], ';': [0,   2.5948, 1, 2, 9],
            'z': [2,   3.9036, 0, 3, 0], 'x': [2,   2.6062, 0, 3, 1], 'c': [2,   1.3088, 0, 3, 2],
            'v': [2,   1.3088, 0, 3, 3], 'b': [3.5, 1.3088, 0, 3, 3], 'n': [2,   1.3088, 1, 3, 6],
            'm': [2,   1.3088, 1, 3, 6], ',': [2,   1.3088, 1, 3, 7], '.': [2,   2.6062, 1, 3, 8],
            '/': [2,   3.9036, 1, 3, 9], '~': [4,   3.9036, 0, 3, 0], '|': [4,   3.9036, 1, 3, 9]
        };

        length = this.len;
        maxEffort = this.eff;

        // Generate the first draft of the password.
        password = '';
        for (i = 0; i < length; ++i) {
            password += pool[Math.floor(Math.random() * 83)];
        }

        // This will store cached effort calculations for triads to improve efficiency.
        effortCache = {};

        do {
            // Replace a random character in the password.
            i = Math.floor(Math.random() * length);
            password = password.substr(0, i) +
                pool[Math.floor(Math.random() * 83)] +
                password.substr(i + 1);

            // Translate all the keys that need shift.
            keys = '';
            for (i = 0; i < length; ++i) {
                keys += shiftMap[password[i]] !== undefined ? shiftMap[password[i]] : password[i];
            }

            // Get the total number of triads.
            numTriads = keys.length - 2;
            // This will store the overall effort of the password.
            totalEffort = 0;

            for (i = 0; i < numTriads; ++i) {
                c1 = keys[i];
                c2 = keys[i + 1];
                c3 = keys[i + 2];
                triad = c1 + c2 + c3;

                if (effortCache[triad] !== undefined) {
                    // Don't calculate the effort of this triad if we already know it.
                    totalEffort += effortCache[triad];
                    continue;
                }

                // Base distances and penalties.
                triadEffort  = 0.3555 * keyData[c1][0] *
                    (1 + 0.367 * keyData[c2][0] * (1 + 0.235 * keyData[c3][0]));
                triadEffort += 0.6423 * keyData[c1][1] *
                    (1 + 0.367 * keyData[c2][1] * (1 + 0.235 * keyData[c3][1]));

                // Hand penalty calculation.
                if (keyData[c1][2] === keyData[c3][2]) {
                    if (keyData[c2][2] === keyData[c3][2]) {
                        // Same hand.
                        pHand = 2;
                    } else {
                        // Alternating.
                        pHand = 1;
                    }
                } else {
                    // Both used, not alternating.
                    pHand = 0;
                }

                // Row penalty calculation.
                row1 = keyData[c1][3];
                row2 = keyData[c2][3];
                row3 = keyData[c3][3];
                drMaxAbs = 0;
                drMax = 0;
                if (Math.abs(row1 - row2) > drMaxAbs) {
                    drMax = row1 - row2;
                    drMaxAbs = Math.abs(drMax);
                }
                if (Math.abs(row1 - row3) > drMaxAbs) {
                    drMax = row1 - row3;
                    drMaxAbs = Math.abs(drMax);
                }
                if (Math.abs(row2 - row3) > drMaxAbs) {
                    drMax = row2 - row3;
                    drMaxAbs = Math.abs(drMax);
                }
                if (row1 < row2) {
                    if (row3 === row2) {
                        // Downward progression with repetition: 1 < 2 = 3.
                        pRow = 1;
                    } else if (row2 < row3) {
                        // Downward progression: 1 < 2 < 3.
                        pRow = 4;
                    } else if (drMaxAbs === 1) {
                        pRow = 3;
                    } else {
                        // All/some different; delta row > 1.
                        if (drMax < 0) {
                            pRow = 7;
                        } else {
                            pRow = 5;
                        }
                    }
                } else if (row1 > row2) {
                    if (row3 === row2) {
                        // Upward progression with repetition: 1 > 2 = 3.
                        pRow = 2;
                    } else if (row2 > row3) {
                        // Upward progression: 1 > 2 > 3.
                        pRow = 6;
                    } else if (drMaxAbs === 1) {
                        pRow = 3;
                    } else {
                        if (drMax < 0) {
                            pRow = 7;
                        } else {
                            pRow = 5;
                        }
                    }
                } else {
                    if (row2 > row3) {
                        // Upward progression with repetition: 1 = 2 > 3.
                        pRow = 2;
                    } else if (row2 < row3) {
                        // Downward progression with repetition: 1 = 2 < 3.
                        pRow = 1;
                    } else {
                        // All same.
                        pRow = 0;
                    }
                }//end if

                // Finger penalty calculation.
                finger1 = keyData[c1][4];
                finger2 = keyData[c2][4];
                finger3 = keyData[c3][4];
                if (finger1 > finger2) {
                    if (finger2 > finger3) {
                        // Monotonic; all different: 1 > 2 > 3.
                        pFinger = 0;
                    } else if (finger2 === finger3) {
                        // Monotonic; some different: 1 > 2 = 3.
                        if (c2 === c3) {
                            pFinger = 1;
                        } else {
                            pFinger = 6;
                        }
                    } else if (finger3 === finger1) {
                        pFinger = 4;
                    } else if (finger1 > finger3 && finger3 > finger2) {
                        // Rolling.
                        pFinger = 2;
                    } else {
                        // Not monotonic; all different.
                        pFinger = 3;
                    }
                } else if (finger1 < finger2) {
                    if (finger2 < finger3) {
                        // Monotonic; all different: 1 < 2 < 3.
                        pFinger = 0;
                    } else if (finger2 === finger3) {
                        if (c2 === c3) {
                            // Monotonic; some different: 1 < 2 = 3.
                            pFinger = 1;
                        } else {
                            pFinger = 6;
                        }
                    } else if (finger3 === finger1) {
                        // Not monotonic; some different: 1 = 3 < 2.
                        pFinger = 4;
                    } else if (finger1 < finger3 && finger3 < finger2) {
                        // Rolling.
                        pFinger = 2;
                    } else {
                        // Not monotonic; all different.
                        pFinger = 3;
                    }
                } else if (finger1 === finger2) {
                    if (finger2 < finger3 || finger3 < finger1) {
                        // Monotonic; some different: 1 = 2 < 3, 3 < 1 = 2.
                        if (c1 === c2) {
                            pFinger = 1;
                        } else {
                            pFinger = 6;
                        }
                    } else if (finger2 === finger3) {
                        if (c1 !== c2 && c2 !== c3 && c1 !== c3) {
                            pFinger = 7;
                        } else {
                            // All same.
                            pFinger = 5;
                        }
                    }
                }//end if

                // Stroke path effort.
                triadEffort += 0.4268 * (pHand + 0.3 * pRow + 0.3 * pFinger);

                effortCache[triad] = triadEffort;
                totalEffort += triadEffort;
            }

            totalEffort = totalEffort / numTriads;
        } while (totalEffort > maxEffort
            || !password.match(/[0-9]/)
            || !password.match(/[A-Z]/)
            || !password.match(/[a-z]/)
            || !password.match(/[^0-9A-Za-z]/)
        );

        if (totalEffort < 2.68) {
            this.ar.style.left = '15px';
            this.ar.src = 'images/arrow-left.png';
        } else {
            this.ar.style.left = Math.round((281 / 5.046) * (totalEffort - 2.68) + 16) + 'px';
            this.ar.src = 'images/arrow-down.png';
        }
        password = password.replace('<', '&lt;').replace('>', '&gt;');
        this.ps.innerHTML = password;
        this.bd.style.display = 'none';
        this.bt.style.display = 'block';
    },
    spl: function(x)
    {
        if (x < 24) {
            x = 12;
            this.len = 8;
        } else if (x < 47) {
            x = 35;
            this.len = 9;
        } else if (x < 71) {
            x = 59;
            this.len = 10;
        } else if (x < 94) {
            x = 82;
            this.len = 11;
        } else if (x < 118) {
            x = 106;
            this.len = 12;
        } else if (x < 141) {
            x = 129;
            this.len = 13;
        } else if (x < 165) {
            x = 153;
            this.len = 14;
        } else if (x < 188) {
            x = 176;
            this.len = 15;
        } else if (x < 211) {
            x = 199;
            this.len = 16;
        } else if (x < 235) {
            x = 223;
            this.len = 17;
        } else if (x < 258) {
            x = 246;
            this.len = 18;
        } else if (x < 282) {
            x = 270;
            this.len = 19;
        } else {
            x = 293;
            this.len = 20;
        }
        this.lp.style.left = x + 'px';
    },
    sme: function(x)
    {
        if (x < 12) {
            x = 12;
        } else if (x > 293) {
            x = 293;
        }
        this.eff = (5.046 / 281) * (x - 12) + 2.68;
        this.ep.style.left = x + 'px';
    }
};
