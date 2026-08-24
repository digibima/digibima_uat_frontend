<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Insurance Comparison</title>

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        @page {
            size: A4;
            margin: 25px;
        }

        body {
            font-family: Arial, sans-serif;
            background: #f3f4f6;
            color: #374151;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999;
            opacity: 0.05;
            pointer-events: none;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
        }

        .watermark img {
            width: 450px;
            height: auto;
            object-fit: contain;
        }

        .container {
            max-width: 1200px;
            margin: auto;
            position: relative;
            z-index: 2;
        }

        .header {
            background: #ffffff;
            padding: 18px 28px;
            border-radius: 14px;
            margin-bottom: 25px;
            border: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            height: 60px;
            width: auto;
            object-fit: contain;
        }

        .company-details {
            text-align: right;
            line-height: 28px;
            color: #4b5563;
            font-size: 14px;
            font-weight: 500;
        }

        .section {
            background: #ffffff;
            border-radius: 14px;
            overflow: hidden;
            margin-bottom: 25px;
            border: 1px solid #e5e7eb;
            page-break-inside: avoid;
        }

        .section-title {
            background: #dbeafe;
            padding: 16px 20px;
            font-weight: bold;
            color: #1d4ed8;
            font-size: 18px;
        }

        .details-table {
            width: 100%;
            border-collapse: collapse;
        }

        .details-table td {
            padding: 16px 20px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 14px;
        }

        .label {
            font-weight: bold;
            color: #111827;
        }

        .comparison-wrapper {
            background: #ffffff;
            border-radius: 14px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
        }

        .comparison-table {
            width: 100%;
            border-collapse: collapse;
        }

        .comparison-table thead {
            display: table-header-group;
        }

        .comparison-table tr {
            page-break-inside: avoid;
        }

        .comparison-table th {
            background: #dbeafe;
            padding: 20px 10px;
            border: 1px solid #bfdbfe;
        }

        .comparison-table td {
            border: 1px solid #e5e7eb;
            padding: 16px 10px;
            text-align: center;
            font-size: 14px;
        }

        .feature-column {
            width: 260px;
            text-align: left !important;
            background: #f8fafc;
            font-weight: bold;
        }

        .vendor-name {
            font-size: 20px;
            font-weight: bold;
            color: #1e3a8a;
        }

        .premium {
            background: #ecfdf5;
            color: #059669;
            font-size: 20px;
            font-weight: bold;
        }

        .check {
            color: #16a34a;
            font-weight: bold;
        }

        .cross {
            color: #dc2626;
            font-weight: bold;
        }

        .section-row {
            background: #eff6ff;
            color: #1d4ed8;
            font-size: 17px;
            font-weight: bold;
            text-align: left !important;
            padding: 16px !important;
        }

        .footer {
            margin-top: 25px;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 15px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }

        @media print {

            body {
                background: #ffffff;
            }

            .header,
            .section,
            .comparison-wrapper,
            .footer {
                box-shadow: none;
            }
        }
    </style>

</head>

<body>


    <div class="watermark">
        <img src="{{ public_path('images/dashboard/policypdf-watermark.png') }}" alt="">
    </div>

    <div class="container">

        <div class="header">

            <div>
                <img src="{{ public_path('images/dashboard/logo.png') }}" class="logo">
            </div>

            <div class="company-details">

                <div>
                    📧 info@digibima.com
                </div>

                <div>
                    📞 +91 9119 173 733
                </div>

            </div>

        </div>


        <div class="section">

            <div class="section-title">
                Customer & Vehicle Details
            </div>

            <table class="details-table">

                <tr>

                    <td>
                        <span class="label">Customer:</span>

                        {{ !empty($customer_name) ? $customer_name : '' }}
                    </td>

                    <td>
                        <span class="label">Mobile:</span>

                        {{ !empty($mobile) ? $mobile : '' }}
                    </td>

                </tr>

                <tr>

                    <td>
                        <span class="label">Vehicle:</span>

                        {{ !empty($vehicle_name) ? $vehicle_name : '' }}
                    </td>

                    <td>
                        <span class="label">Registration:</span>

                        {{ !empty($registration_number) ? $registration_number : '' }}
                    </td>

                </tr>

            </table>

        </div>

        <!-- COMPARISON TABLE -->

        <div class="comparison-wrapper">

            <table class="comparison-table">

                <thead>

                    <tr>

                        <th class="feature-column">
                            Features
                        </th>

                        @foreach($data['quotes'] as $quote)

                            <th>

                                <div class="vendor-name">
                                    {{ $quote['company_name'] }}
                                </div>

                            </th>

                        @endforeach

                    </tr>

                </thead>

                <tbody>


                    <tr>

                        <td class="feature-column">
                            Premium
                        </td>

                        @foreach($data['quotes'] as $quote)

                            <td class="premium">

                                @if(!empty($quote['premium']))

                                    ₹{{ number_format($quote['premium'], 2) }}

                                @endif

                            </td>

                        @endforeach

                    </tr>

                    <!-- ADDON TITLE -->

                    <tr>

                        <td colspan="{{ count($data['quotes']) + 1 }}" class="section-row">

                            Add-on Comparison

                        </td>

                    </tr>

                    <!-- ADDON ROWS -->

                    @foreach($data['comparison'] as $comparison)

                        <tr>

                            <td class="feature-column">

                                {{ $comparison['addon'] }}

                            </td>

                            @foreach($data['quotes'] as $quote)

                                @php

                                    $quoteKey = $quote['quote_name'];

                                    $value = $comparison[$quoteKey] ?? false;

                                @endphp

                                <td class="{{ $value ? 'check' : 'cross' }}">

                                    {!! $value ? '✔ Included' : '✘ Not Included' !!}

                                </td>

                            @endforeach

                        </tr>

                    @endforeach

                </tbody>

            </table>

        </div>

        <!-- FOOTER -->

        <div class="footer">

            This comparison sheet is generated for customer reference only.

            <br>

            © {{ date('Y') }} Digibima. All rights reserved.

        </div>

    </div>

</body>

</html>