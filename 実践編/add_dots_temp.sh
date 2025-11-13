#!/bin/bash

# practice-01-step2.html にセクションIDを追加
cd "C:\CLAUDE_CODE\01_RUMOS_Project\GAS短期講座 V2.0\実践編"

# step2のセクションにIDを追加
sed -i '147s/<section class="mb-20">/<section id="what-is-prompt" class="mb-20">/' practice-01-step2.html
sed -i '190s/<section class="mb-20">/<section id="prompt-structure" class="mb-20">/' practice-01-step2.html
sed -i '228s/<section class="mb-20">/<section id="prompt-example" class="mb-20">/' practice-01-step2.html
sed -i '294s/<section class="mb-20">/<section id="after-sending" class="mb-20">/' practice-01-step2.html

# step3のセクションにIDを追加
sed -i '132s/<section class="mb-20">/<section id="intro" class="mb-20">/' practice-01-step3.html
sed -i '151s/<section class="mb-20">/<section id="paste-steps" class="mb-20">/' practice-01-step3.html
sed-i '357s/<section class="mb-20">/<section id="project-rename" class="mb-20">/' practice-01-step3.html

# step4のセクションにIDを追加
sed -i '133s/<section class="mb-20">/<section id="what-is-auth" class="mb-20">/' practice-01-step4.html
sed -i '169s/<section class="mb-20">/<section id="auth-steps" class="mb-20">/' practice-01-step4.html
sed -i '378s/<section class="mb-20">/<section id="notes" class="mb-20">/' practice-01-step4.html

# step5のセクションにIDを追加
sed -i '132s/<section class="mb-20">/<section id="intro" class="mb-20">/' practice-01-step5.html
sed -i '153s/<section class="mb-20">/<section id="check-points" class="mb-20">/' practice-01-step5.html
sed -i '326s/<section class="mb-20">/<section id="errors" class="mb-20">/' practice-01-step5.html
sed -i '376s/<section class="mb-20">/<section id="troubleshooting" class="mb-20">/' practice-01-step5.html

# step6のセクションにIDを追加
sed -i '136s/<section class="mb-20">/<section id="what-is-trigger" class="mb-20">/' practice-01-step6.html
sed -i '191s/<section class="mb-20">/<section id="trigger-setup" class="mb-20">/' practice-01-step6.html
sed -i '312s/<section class="mb-20">/<section id="example" class="mb-20">/' practice-01-step6.html
sed -i '354s/<section class="mb-20">/<section id="warnings" class="mb-20">/' practice-01-step6.html

# summaryのセクションにIDを追加
sed -i '117s/<section class="mb-20">/<section id="achievements" class="mb-20">/' practice-01-summary.html
sed -i '161s/<section class="mb-20">/<section id="learned" class="mb-20">/' practice-01-summary.html
sed -i '234s/<section class="mb-20">/<section id="next-steps" class="mb-20">/' practice-01-summary.html
sed -i '283s/<section class="mb-20">/<section id="help" class="mb-20">/' practice-01-summary.html

echo "セクションID追加完了"
